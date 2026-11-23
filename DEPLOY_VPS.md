# Deploying DonaJyoti Dental Clinic Website to a VPS

This project is a 100% static HTML/CSS/JS website — no Node.js runtime or database is required on your VPS.

## Files to Upload
Upload the following to `/var/www/donajyoti-dental/` on your VPS (skip `backup/` unless you want it stored off-root):
- `index.html`
- `about-us.html`
- `treatments.html`
- `blogs.html`
- `contact-us.html`
- `robots.txt`
- `sitemap.xml`
- `assets/`
- `blog-images/`

---

## Step 1: Upload Website Files from Windows PowerShell
Replace `root@YOUR_VPS_IP` with your VPS user and IP address:

```powershell
ssh root@YOUR_VPS_IP "mkdir -p /var/www/donajyoti-dental"
scp -r index.html about-us.html treatments.html blogs.html contact-us.html robots.txt sitemap.xml assets blog-images root@YOUR_VPS_IP:/var/www/donajyoti-dental/
```

---

## Step 2: Configure Nginx on Your VPS
SSH into your VPS (`ssh root@YOUR_VPS_IP`) and run:

```bash
sudo apt update && sudo apt install -y nginx
sudo chown -R www-data:www-data /var/www/donajyoti-dental
sudo chmod -R 755 /var/www/donajyoti-dental
```

Copy `nginx.conf` to `/etc/nginx/sites-available/donajyoti-dental` (replace `yourdomain.com` with your real domain or VPS IP), then enable it:

```bash
sudo ln -sf /etc/nginx/sites-available/donajyoti-dental /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 3: Enable Free HTTPS (SSL) with Certbot
Once your domain DNS `A` record points to your VPS IP:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## Restoring "Braces & Care" Later
The removed page is safely backed up at `backup/invisalign.html`. To restore it later, move `backup/invisalign.html` back to the root folder and re-add `<li><a href="invisalign.html">Braces &amp; Care</a></li>` to the navigation menus.
