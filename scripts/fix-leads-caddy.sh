#!/usr/bin/env bash
# Run on VPS 153.80.242.53 as root.
# Symptom: https://153-80-242-53.sslip.io/api/health times out on :443,
# while http://153.80.242.53:3001/api/health and Caddy :80 work.

set -euo pipefail

echo "== ports =="
ss -lntp | grep -E ':(80|443|3001)\s' || true

echo "== ufw =="
ufw status verbose || true

echo "== open 443 if needed =="
ufw allow 443/tcp || true
iptables -I INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || true

echo "== caddy =="
systemctl restart caddy || service caddy restart || true
sleep 2
systemctl status caddy --no-pager || true
journalctl -u caddy -n 40 --no-pager || true

echo "== local probes =="
curl -sS -m 5 http://127.0.0.1:3001/api/health || true
echo
curl -sS -m 5 -k https://127.0.0.1/api/health || true
echo
curl -sS -m 5 https://153-80-242-53.sslip.io/api/health || true
echo

echo "== pm2 leads =="
pm2 status || true
pm2 restart dev2026-leads || true

echo "Done. From your PC: curl -m 8 https://153-80-242-53.sslip.io/api/health"
