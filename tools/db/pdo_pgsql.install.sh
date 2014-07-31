if  which php >/dev/null ; then
    if  which pecl >/dev/null ; then
        if  php -m | grep pdo_pgsql >/dev/null ; then
            echo -e "\nPostgres PHP extension is installed successfully!"
            exit 0
        else
            sudo pecl download pdo_pgsql
            sudo tar -xzvf PDO_PGSQL-1.0.2.tgz
            cd PDO_PGSQL-1.0.2
            sudo phpize
            sudo ./configure --with-pdo-pgsql=/usr/local
            sudo make && sudo make install
            cd ..
            sudo rm -rf PDO_PGSQL-1.0.2*
            sudo rm -rf package*.xml

            echo -e "\nMake sure to edit your php.ini file and enable the pdo_pgsql extension like so:";
            echo "extension=pdo_pgsql.so"

            echo -e "\nphp.ini file(s): "
            php --ini
        fi;
    else
        echo -e "\npecl is not installed!";
        exit 1
    fi;
else
    echo -e "\nPHP is not installed!";
    exit 1
fi;
