# Node App Manager

## Installation

```bash
yarn install
```

## Running the app

```bash
# development
yarn run start:dev

# On your local machine
yarn run start:local

# production mode
yarn run start:prod

# watch mode
yarn run watch:dev

```

## Port 80 and 443

To allow node to run on port 80 and 443 run

```bash
sudo /sbin/sysctl -w net.ipv4.ip_unprivileged_port_start=0
```

To keep this setting even after a reboot edit the file `/etc/sysctl.conf` and add `net.ipv4.ip_unprivileged_port_start=0` to the end of the file:;

```sh
sudo vim /etc/sysctl.conf
```

### EADDRINUSE

If you get an error like this `EADDRINUSE: address already in use :::80` a program on your machine is already using this port, to find out which program this is run:

```sh
sudo lsof -i :80
```

Now you can kill this process with:

```sh
sudo kill -9 {PID}
```

## Firewall

If the manager should be accessible directly without a classical webserver like nginx or apache, it is important to configure the firewall accordingly to increase the security.
We recommend to follow the [following article](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-20-04-de) with a few customizations:

## TODO

### Continuous Integration

Add support for watching the git branch and restart the applications on new commits

* https://github.com/seymen/git-last-commit

Compare current commit with latest remote commit:

```sh
git fetch origin
git rev-parse HEAD # Outputs current commit hash
git rev-parse origin/master # Outputs latest remote commit hash
```

## License

  Nest is [MIT licensed](LICENSE).
