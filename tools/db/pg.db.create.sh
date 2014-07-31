#!/bin/sh

execpath=$(dirname $BASH_SOURCE)

if ! which psql >/dev/null; then
    echo "Postgres isn't installed! Exiting...";
    exit 1;
fi

# Set up database user. Run this script immediately after cloning the codebase and before rake db:setup.

echo "\nYour db name:"
read dbname;

echo "\nYour db username:"
read username;

echo "\nWould you like a password generated for you? (y or n)"
read passgen;

if [[ $passgen == 'y' ]]; then
    timestamp=$(date +%s)
    hashstart=$dbname$timestamp
    password=$(md5 -qs $hashstart);
else
    echo "\nYour db password:"
    read password;
fi;

createuser $username --login --createdb;

if [ $? -eq 0 ]; then
    echo "$username created!"
else
    echo "$username not created!"
fi

cp -f $execpath/pg.db.create.sql $execpath/pg.db.$dbname.create.sql

contents=$(sed -e s/DBNAME/"$dbname"/g -e s/USERNAME/"$username"/g -e s/PASSWD/"$password"/g $execpath/pg.db.$dbname.create.sql)
echo "$contents" > $execpath/pg.db.$dbname.create.sql

# sed -e "s|{dbname}|$dbname|g" ./pg.db.$dbname.create.sql
# sed -e "s|{username}|$username|g" ./pg.db.$dbname.create.sql
# sed -e "s|{password}|$password|g" ./pg.db.$dbname.create.sql

echo "Recreating the database '$dbname' in postgres."
# export PGPASSWORD="$password"
psql -h localhost -U postgres -a -f $execpath/pg.db.$dbname.create.sql

if [ $? -eq 0 ]; then
    echo "Password to $dbname with user $username is '$password'"
    echo "#!/bin/sh\n\necho \"Recreating the database '$dbname' in postgres.\"\npsql -h localhost -U postgres -a -f $execpath/pg.db.$dbname.create.sql" > $execpath/pg.db.$dbname.create.sh
    chmod 755 $execpath/pg.db.$dbname.create.sh
else
    echo "$dbname not created!"
fi


