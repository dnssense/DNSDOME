sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT
sudo iptables -t nat -F
sudo iptables -t mangle -F
sudo iptables -F
sudo iptables -X
sudo iptables -t nat -L
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -t nat -A OUTPUT -o lo -p tcp --dport 80 -j REDIRECT --to-ports 8080
iptables -t nat -A OUTPUT -o lo -p tcp --dport 443 -j REDIRECT --to-ports 8443
iptables -t nat -A OUTPUT -o wlo1 -p tcp --dport 80 -j REDIRECT --to-ports 8080
iptables -t nat -A OUTPUT -o wlo1 -p tcp --dport 443 -j REDIRECT --to-ports 8443

sudo iptables -t nat -L
