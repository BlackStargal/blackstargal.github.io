---
title: Apocalyst Writeup(Medium)
published: true
---

![machine logo](/assets/apocalyst/logo.png)

# [](#header-2)Recognition

First of all we do a scan with nmap:

```bash
sudo nmap -sS -p- --open 10.129.229.14 -n -Pn -v
```

The nmap command reported the following ports:
*   Port 22
*   Port 80

We do a second and more advanced scan:

```bash
sudo nmap -sCV -p22,80 10.129.229.14
```

The scan reports the following information:

![Escaneo nmap](/assets/apocalyst/nmapScan.png)

We can see that the **ssh** version is vulnerable to **user enumeration(CVE-2016-6210)** and there is a **web service** running with Apache and using the CMS **Wordpress 4.8**.

For the moment we are going to start with the web server.

![whatweb command](/assets/apocalyst/whatweb.png)

The **whatweb** command doesn't give us much information so let's visit the website.

![website](/assets/apocalyst/website.png)

The website is not charging all the elements so we inspect the **source code**.

![virtual hosting](/assets/apocalyst/notCharging.png)

The website is tring to charge content from **http://apocalyst.htb** so we add it to the **/etc/hosts** file.

Make sure you run the following command as **root**.
```bash
echo "10.129.229.14 apocalyst.htb" >> /etc/hosts
```
Now the website should look like this:

![final website](/assets/apocalyst/charging.png)

Reading the website we don't find anything **important** so we search other directories.

![gobuster scan](/assets/apocalyst/gobuster.png)

With the scan we see a lot of results but **no important** ones so we make a custom dictionary with the webpage content using **cewl**.

```bash
cewl http://10.129.42.164 -w wordlist.txt
```

This command gives us a **dictionary** that we can use with **gobuster**.

![gobuster custom dictionary](/assets/apocalyst/gobusterCustomDic.png)

There are a lot of results with a **size of 157** so we hide them.

![gobuster custom dictionary hide size](/assets/apocalyst/gobusterLength157.png)

Now we have only **one dir** so we scan it.

![gobuster last scan](/assets/apocalyst/lastGobusterScan.png)

When we access this file theres only an image so we download it.

![index.html image](/assets/apocalyst/indexImage.png)

We use **steghide** to analyze this image.

![steghide info](/assets/apocalyst/steghideInfo.png)

We see a adjunted file so we try to extract that.

```bash
steghide extract -sf image.jpg
```

This looks like a dictionary that we can use to brute force the wordpress login.

We see that the user who owns the posts is **falaraki**.

# [](#header-2)Explotation

We use **wpscan** for brute force the wordpress login with the **list.txt** file as **dictionary**.

First we put the **username falaraki** in a file named user.txt and next we use the following command:

```bash
wpscan --url http://apocalyst.htb --api-token <token> -U user.txt -P list.txt
```

![falaraki password](/assets/apocalyst/password.png)

We login with this **credentials** to the **wordpress dashboard**.

We go to **Appearance** and **Editor** and we edit **single.php(Single Post)**.

And we use the [pentestmonkey](https://github.com/pentestmonkey/php-reverse-shell/blob/master/php-reverse-shell.php) reverse shell and then we visit any post.

We get a **full tty** with the following commands:

```bash
script /dev/null -qc /bin/bash #/dev/null is to not store anything
(inside the nc session) CTRL+Z;stty raw -echo; fg; ls; export SHELL=/bin/bash; export TERM=screen; stty rows 38 columns 116; reset;
```
We get the **user flag** from the falaraki home directory:

![user flag](/assets/apocalyst/userflag.png)

And we can see a hidden file with name **.secret** as well and opening it we see that is **base64 encoded** so we decode it and we get the **user password**:

![user password](/assets/apocalyst/userPassword.png)

With the **user credentials** we change to the user falaraki.

# [](#header-2)Privilege Escalation

Using [linpeas](https://github.com/peass-ng/PEASS-ng) we see that we can write the **/etc/passwd** file.

![/etc/passwd writeable](/assets/apocalyst/etcPasswd.png)

So we generate a **new password**.

```bash
openssl passwd -1 -salt password password
```
And then we put it in the /etc/passwd to the root user.

![root password change](/assets/apocalyst/rootPass.png)

And switch to root with the password "password".

Now that we are root we can see the **root flag**.

![root flag](/assets/apocalyst/rootFlag.png)
