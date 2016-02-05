import ftplib
import os

print('Skipping deploy, server not yet ready.')
exit(0)

ftp = ftplib.FTP('ftp.wenfo.org', os.environ['FTP_USER'], os.environ['FTP_PASSWORD'])
ftp.cwd('/public_html/aus-env/')

for root, _, files in os.walk('dist'):
    for f in files:
        file = os.path.join(root, f)
        with open(file, "rb") as fobj:
            ftp.storbinary("STOR " + file, fobj)

ftp.quit()
