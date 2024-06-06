---
title: Antique Writeup(Easy)
published: true
---

![machine logo](/assets/antique/logo.png)

# [](#header-2)Recognition

First of all we do a scan with nmap:

```bash
sudo nmap -sS -p- --open 10.129.211.143 -n -Pn -v
```

The nmap command reported the following ports:
*   Port 23

We do a second, more advanced scan:

```bash
sudo nmap -sCV -p23 10.129.211.143
```

The scan reports the following information:

![nmap scan](/assets/antique/nmapScan.png)

The scan doesn't report any important info so we continue with the enumeration.

We use telnet to connect to the machine, but we only see "**HP JetDirect**", so we continue enumerating the **UDP** ports.

```bash
nmap -sU -sCV 10.129.211.143
```

This scan reports us the following information:

![UDP scan](/assets/antique/udpScan.png)

So we use **smtpwalk** to enumerate this port:

![snmpwalk](/assets/antique/snmpwalk.png)

We don't see any interesting information but searching we find a **vulnerability(CVE-2002-1048)**, this vulnerability permits an attacker to get the **password** so we try to exploit it.

# [](#header-2)Explotation

We use **snmpwalk** to exploit this vulnerability:

![snmpwalk exploit](/assets/antique/snmpwalkExploit.png)

This returns the **password in hexadecimal** so we decrypt it using [CyberChef](https://cyberchef.org)

![cyberchef](/assets/antique/cyberchef.png)

With the password we try to connect via **telnet** and try to get a **reverse shell**.

![reverse shell](/assets/antique/reverseshell.png)

We get the **user flag**:

![user flag](/assets/antique/userflag.png)

# [](#header-2)Privilege Escalation

Using the following command we see that the **port 631** is open:

```bash
netstat -nat
```

We use **chisel** to do a **port forward** and see the port in the attacker machine.

![chisel port forward](/assets/antique/chisel.png)

When we visit **http://localhost:631** we find the following website:

![port 631 website](/assets/antique/631port.png)

When we go to the **administrator tab** we can view the **error log** so we can change the file that reads to read the **root flag**.

```bash
cupsctl ErrorLog="/root/root.txt"
```

![root flag](/assets/antique/rootflag.png)
