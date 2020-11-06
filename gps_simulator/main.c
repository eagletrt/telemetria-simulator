#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include "./gps_service/gps_service.h"

// Let this shit to use asprintf
#ifndef _GNU_SOURCE
#define _GNU_SOURCE 1
#endif

void printMessage(char* message);
void printError(char* message);

int getDelta(int* previousT, int* currentT, char* line);

int main(int argc, char const *argv[])
{
    usleep(1000 * 1000);

    int previousT = 0, currentT = 0, deltaT = 0;
    //get the master id
    int gps_port = openGPSPort("/dev/ptmx");
    

    // grant access to the slave
    if(grantpt(gps_port) < 0)
    {
        printError("grantpt");
        exit(1);
    }

    // unlock the slave
    if(unlockpt(gps_port) < 0)
    {
        printError("unlockpt");
        exit(1);
    }

    // get the path to the slave
    char slavepath[64];
    if(ptsname_r(gps_port, slavepath, sizeof(slavepath)) < 0)
    {
        printError("ptsname_r");
        exit(1);
    }

    char* gpsInterfaceMessage;
    asprintf(&gpsInterfaceMessage, "GPS INTERFACE: %s", slavepath);
    printMessage(gpsInterfaceMessage);
    free(gpsInterfaceMessage);
    
    
    while(1){
        char* line = NULL;
        size_t len = 0;

        FILE* fp;
        char* ubxSource = (argc > 1) ? argv[1] : "gps.txt"; // TODO: ....
        fp = fopen(ubxSource, "r");

        char* ubxSourceMessage;
        asprintf(&ubxSourceMessage, "UBX SOURCE: %s", ubxSource);
        printMessage(ubxSourceMessage);
        free(ubxSourceMessage);
        
        if (fp == NULL)
        {
            printError("Error opening file!\n");
            exit(1);
        }
        int t = 0;

        while (t != -1)
        {
            t = getline(&line, &len, fp);
            deltaT = getDelta(&previousT, &currentT, line);
            sleep(deltaT);
            int written_bytes = write(gps_port,line,t);
            line = NULL;
            len = 0;
        }

        free(line);
        fclose(fp);
    }

    return 0;
}


int getDelta(int* previousT, int* currentT, char* line){

    previousT = currentT;
    if (strstr(line,"GGA"))
    {
        gps_gga_struct* gga = (gps_gga_struct*) malloc(sizeof(gps_gga_struct));
        gga = parseGGA(line);
        *currentT = atoi(gga->utc_time);
        free(gga);
        return currentT - previousT;
    }
    else if (strstr(line,"GLL"))
    {
        gps_gll_struct* gll = (gps_gll_struct*) malloc(sizeof(gps_gll_struct));
        gll = parseGLL(line);
        *currentT = atoi(gll->utc_time);
        free(gll);
        return currentT - previousT;      
    }
    else if (strstr(line,"VTG"))
    {
        return 0;
    }
    else if (strstr(line,"RMC"))
    {
        gps_rmc_struct* rmc = (gps_rmc_struct*) malloc(sizeof(gps_rmc_struct));
        rmc = parseRMC(line);
        *currentT = atoi(rmc->utc_time);
        free(rmc);
        return currentT - previousT; 
    }
}

void printMessage(char* message) {
    printf("[GPS] {MESSAGE} %s\n", message);
    fflush(stdout);
}

void printError(char* message) {
    printf("[GPS] {ERROR} %s\n", message);
    fflush(stderr);
}