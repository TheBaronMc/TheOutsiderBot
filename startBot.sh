#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

function botIsRunnable() {
    runnable='1'
    unavailablePrograms=""

    if [ -z ${NVM_DIR+x} ]
    then
        unavailablePrograms = "${unavailablePrograms} nvm"
        runnable='0'
    fi

    if ! command -v docker &> /dev/null
    then
        unavailablePrograms="${unavailablePrograms} docker"
        runnable='0'  
    fi

    if ! command -v docker-compose &> /dev/null
    then
        unavailablePrograms="${unavailablePrograms} docker-compose"
        runnable='0'
    fi
}

function showError() {
    for i in $1
    do
        if [ $i = "nvm" ] 
        then
            printf "\n\n${RED}===================== NVM NOT INSTALLED ======================\n"
            printf "  + To install nvm you need to follow this link :\n"
            printf "     https://github.com/nvm-sh/nvm#install--update-script\n"
            printf "  + Then excute those commands :\n"
            printf "     nvm install 12\n"
            printf "     npm install -g discord\n"
            printf "==============================================================${NC}\n\n"
        elif [ $i = "docker" ]
        then
            printf "\n\n${RED}==================== DOCKER NOT INSTALLED ====================\n"
            printf "  + To install docker you need to follow this link :\n"
            printf "     https://docs.docker.com/engine/install/\n"
            printf "==============================================================${NC}\n\n"
        elif [ $i = "docker-compose" ]
        then
            printf "\n\n${RED}================ DOCKER-COMPOSE NOT INSTALLED ================\n"
            printf "  + To install docker-compose you need to follow this link :\n"
            printf "     https://docs.docker.com/compose/install/\n"
            printf "==============================================================${NC}\n\n"
        fi
    done
}

function printHelp() {
    printf "\n${RED}============== HELP GUIDE ==============${NC}\n"
    printf "All the following command are arguments \nWe can use one of them like that : \n./startBot.sh ARGUMENT\n"
    printf "${RED}============== ARGUEMENTS ==============${NC}\n"
    printf " + ${GREEN}start${NC} : will make redis and bot up\n"
    printf " + ${GREEN}stop${NC} : will stop redis and bot\n"
    printf " + ${GREEN}restart${NC} : will restart redis and bot\n"
    printf " + ${GREEN}reset${NC} : will restart bot and make a new container for redis\n\n"
}

if [ $1 = "help" ]
then
    printHelp
    exit 0
elif ! [[ "start stop restart reset" =~ (^|[[:space:]])$1($|[[:space:]]) ]]
then
    printf "\n${RED} You are not using a good argument${NC}\n"
    printHelp
    exit 0
fi

botIsRunnable

if (($runnable=='1'))
then
    if [ -e "index.js" ] && [ -e "redis/docker-compose.yml" ] # Check if you are in the good directory
    then
        if [ $1 = "stop" ]
        then
            docker-compose -f redis/docker-compose.yml stop
            kill $(pgrep "node")
        elif [ $1 = "start" ]
        then
            docker-compose -f redis/docker-compose.yml up -d
            sleep 4
            nohup node index.js &
        elif [ $1 = "restart" ]
        then
            if [ $2 = "-b" ] || [ $2 = "--bot" ]
            then
                kill $(pgrep "node")
                nohup node index.js &
            elif [ $2 = "-d" ] || [ $2 = "--docker-compose" ]
            then
                docker-compose -f redis/docker-compose.yml stop
                docker-compose -f redis/docker-compose.yml up -d
            else
                docker-compose -f redis/docker-compose.yml stop
                kill $(pgrep "node")
                docker-compose -f redis/docker-compose.yml up -d
                sleep 4
                nohup node index.js &
            fi
        elif [ $1 = "reset" ]
        then
            docker-compose -f redis/docker-compose.yml down
            kill $(pgrep "node")
            docker-compose -f redis/docker-compose.yml up -d
            sleep 4
            nohup node index.js &
        fi
    else
        printf "\n${RED}YOU ARE IN THE WRONG DIRECTORY${NC}\n\n"
    fi
else
    showError $unavailablePrograms
fi