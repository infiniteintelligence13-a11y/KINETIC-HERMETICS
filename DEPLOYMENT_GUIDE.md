# Deployment Guide - Kinetic Hermetics

## Quick Start Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database backups enabled
- [ ] SSL/TLS certificates installed
- [ ] Email service verified
- [ ] Payment processing tested
- [ ] API rate limiting configured
- [ ] Logging and monitoring set up
- [ ] Security headers configured
- [ ] CORS properly configured

---

## Deployment Options

### Option 1: Heroku (Easiest for beginners)

#### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed

#### Steps

1. **Create Heroku App**
```bash
heroku create your-app-name
```

2. **Set Environment Variables**
```bash
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_super_secret_key
heroku config:set STRIPE_SECRET_KEY=sk_test_...
heroku config:set STRIPE_PUBLIC_KEY=pk_test_...
heroku config:set SENDGRID_API_KEY=SG.your_key
heroku config:set SENDGRID_FROM_EMAIL=hello@kinetichemetics.com
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-domain.com
```

3. **Deploy**
```bash
git push heroku main
```

4. **View Logs**
```bash
heroku logs --tail
```

#### Heroku Pricing
- Free tier: Limited hours per month
- Professional: $7/month per app (recommended for production)

---

### Option 2: AWS EC2 (More control, scalable)

#### Prerequisites
- AWS account
- EC2 instance (t2.micro eligible for free tier)
- Elastic IP for static address
- Domain name

#### Steps

1. **Launch EC2 Instance**
   - Choose: Ubuntu Server 20.04 LTS
   - Instance type: t2.micro (free tier)
   - Configure security group:
     - Allow SSH (port 22)
     - Allow HTTP (port 80)
     - Allow HTTPS (port 443)

2. **Connect & Setup**
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB (or use MongoDB Atlas)
sudo apt install -y mongodb

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

3. **Clone Repository**
```bash
git clone https://github.com/infiniteintelligence13-a11y/KINETIC-HERMETICS.git
cd KINETIC-HERMETICS/backend
npm install
```

4. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your production values
nano .env
```

5. **Start Application with PM2**
```bash
pm2 start server.js --name "kinetic-hermetics"
pm2 startup
pm2 save
```

6. **Configure Nginx**

Create `/etc/nginx/sites-available/kinetichemetics`:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/kinetichemetics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

7. **Enable HTTPS with Let's Encrypt**
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

### Option 3: DigitalOcean App Platform (Simple & Affordable)

#### Steps

1. **Connect GitHub Repository**
   - Go to DigitalOcean App Platform
   - Select your GitHub repo
   - Auto-detect Node.js

2. **Configure Environment**
   - Add all environment variables
   - Set Build Command: `npm install`
   - Set Run Command: `npm start`

3. **Deployment**
   - Push to main branch
   - DigitalOcean automatically deploys

---

### Option 4: Docker & Kubernetes (Advanced)

#### Create Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

#### Build & Push to Docker Hub
```bash
docker build -t your-username/kinetic-hermetics:latest .
docker push your-username/kinetic-hermetics:latest
```

#### Deploy to Kubernetes
Use provided `kubernetes-deployment.yaml` file

---

## Database Deployment

### MongoDB Atlas (Recommended)

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free

2. **Create Cluster**
   - Choose cloud provider (AWS, Google Cloud, Azure)
   - Region: Choose closest to your users
   - Tier: M0 (free) for development

3. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Add to your `.env`

4. **Configure Network Access**
   - Add IP addresses that can connect
   - For production: Use VPC Peering or IP Whitelist

### Self-Hosted MongoDB

1. **Install MongoDB**
```bash
sudo apt install -y mongodb
```

2. **Enable Authentication**
```bash
# Create admin user
mongo
> use admin
> db.createUser({user: "admin", pwd: "password", roles: ["root"]})
```

3. **Configure Backup**
```bash
# Daily backup cron job
0 2 * * * /usr/bin/mongodump --out /backups/$(date +\%Y\%m\%d)
```

---

## Email Service Setup

### SendGrid Configuration

1. **Create Account**
   - Go to https://sendgrid.com
   - Create free account (12,500 emails/month)

2. **Generate API Key**
   - Settings → API Keys
   - Create new API key
   - Copy and add to `.env`

3. **Verify Sender Email**
   - Settings → Sender Authentication
   - Verify your domain or single email address

4. **Test Email**
```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer $SENDGRID_API_KEY" \
  --header 'Content-Type: application/json' \
  --data '{"personalizations":[{"to":[{"email":"test@example.com"}]}],"from":{"email":"hello@kinetichemetics.com"},"subject":"Test","content":[{"type":"text/html","value":"Test"}]}'
```

---

## Payment Processing Setup

### Stripe Production

1. **Upgrade Account**
   - Complete Stripe account verification
   - Add business details
   - Request production access

2. **Generate Live Keys**
   - Settings → API Keys
   - Copy Live Secret and Publishable Keys

3. **Configure Webhooks**
   - Go to Webhooks
   - Add endpoint: `https://your-domain.com/api/webhooks/stripe`
   - Listen for: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## Security Best Practices

### SSL/TLS Configuration
```nginx
# Force HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### Environment Security
- Never commit `.env` files
- Use different secrets for dev/prod
- Rotate secrets quarterly
- Use AWS Secrets Manager or similar for production

### Database Security
- Enable MongoDB encryption at rest
- Use strong passwords (min 16 characters)
- Limit network access (IP whitelist)
- Regular backups with encryption

### API Security
- Implement rate limiting
- Add request validation
- Use CORS whitelist
- Implement CSRF protection
- Add request signing for webhooks

---

## Monitoring & Logging

### Application Monitoring
```javascript
// Add to server.js
const morgan = require('morgan');
app.use(morgan('combined'));

// Or use Sentry
const Sentry = require("@sentry/node");
Sentry.init({ dsn: "your-sentry-dsn" });
app.use(Sentry.Handlers.errorHandler());
```

### Log Management
- **Option 1**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Option 2**: CloudWatch (AWS)
- **Option 3**: Loggly
- **Option 4**: Papertrail

### Uptime Monitoring
- Use UptimeRobot for free uptime monitoring
- Get alerts if service goes down
- Monitor critical endpoints

---

## Performance Optimization

### Database Indexing
```javascript
// Add indexes to frequently queried fields
userSchema.index({ email: 1 });
webinarRegistrationSchema.index({ webinarId: 1, email: 1 });
```

### Caching
```javascript
// Redis for session/data caching
const redis = require('redis');
const client = redis.createClient();

app.get('/api/webinars', async (req, res) => {
    const cached = client.get('webinars');
    if (cached) return res.json(JSON.parse(cached));
    
    const webinars = await Webinar.find();
    client.setex('webinars', 3600, JSON.stringify(webinars));
    res.json(webinars);
});
```

### Frontend Optimization
- Minify CSS/JS
- Use CDN for static files
- Lazy load images
- Compress images

---

## Backup & Disaster Recovery

### Database Backup
```bash
# Automated daily backup
0 2 * * * mongodump --out /backups/$(date +\%Y\%m\%d)

# Upload to S3
aws s3 sync /backups s3://your-bucket/backups/
```

### Code Backup
```bash
# Push to GitHub (already done)
# Push to backup repo
git remote add backup https://github.com/your-backup-repo.git
git push backup main
```

### Recovery Plan
- Recovery Time Objective (RTO): < 1 hour
- Recovery Point Objective (RPO): < 24 hours
- Test recovery monthly

---

## Post-Deployment

### Health Checks
```bash
# Test API
curl http://your-domain.com/api/webinars

# Test auth
curl -X POST http://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test payments
# Use Stripe test mode
```

### Configure CI/CD
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Heroku
        run: |
          git push https://heroku:${{ secrets.HEROKU_API_KEY }}@git.heroku.com/your-app.git main
```

---

## Support & Resources

- **Documentation**: https://github.com/infiniteintelligence13-a11y/KINETIC-HERMETICS
- **Backend Setup**: See `backend/SETUP_GUIDE.md`
- **API Docs**: See `backend/API_DOCUMENTATION.md`
- **Community**: GitHub Issues

