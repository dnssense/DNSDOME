sudo iptables -P INPUT ACCEPT
sudo iptables -P FORWARD ACCEPT
sudo iptables -P OUTPUT ACCEPT
sudo iptables -t nat -F
sudo iptables -t mangle -F
sudo iptables -F
sudo iptables -X
sudo iptables -t nat -L
sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
sudo iptables -t nat -A PREROUTING -p tcp -d 192.168.43.238 --dport 80 -j DNAT --to 192.168.43.238:8080
sudo iptables -t nat -A PREROUTING -p tcp -d 192.168.43.238 --dport 21 -j DNAT --to 192.168.43.238:8080
sudo iptables -t nat -A PREROUTING -p tcp -d 192.168.43.238 --dport 443 -j DNAT --to 192.168.43.238:8443
#sudo iptables -t nat -A PREROUTING -p tcp --dport 800 -j REDIRECT --to-port 8080
#sudo iptables -t nat -I OUTPUT -p tcp -o lo --dport 80 -j REDIRECT --to-ports 80
sudo iptables -t nat -A POSTROUTING -o wlo1:0 -j MASQUERADE
sudo iptables -t nat -L
