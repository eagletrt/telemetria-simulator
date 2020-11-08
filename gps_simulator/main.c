#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include "./gps_service/gps_service.h"
#include <limits.h>

// Let this shit to use asprintf
#ifndef _GNU_SOURCE
#define _GNU_SOURCE 1
#endif

void printMessage(char* message);
void printError(char* message);

int getDelta(int* previousT, int* currentT, char* line);

int main(int argc, char const *argv[])
{

    int ubxTime = 0;
    int ubxIterations = 1;
    char* ubxSource = NULL;
    char ubxIterationsBuff[101] = "1";

    int opt = 0;
    while ((opt = getopt(argc, argv, "tn:l:")) != -1) {
        switch(opt) {
            case 't':
                ubxTime = 1;
                break;
            case 'n':
                sprintf(ubxIterationsBuff, "%s", optarg); //convert the integer to string when automatically parsed by getopt
                ubxIterations = (ubxIterationsBuff[0] == 'i') ? INT_MAX : atoi(optarg);
                break;
            case 'l':
                ubxSource = optarg;
                break;
            default:
                printError("invalid argument received");
                exit(1);
        }
    }
    if (ubxSource == NULL) {
        printError("the log file has not been specified, use -l <path>");
        exit(1);
    }

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

    // configuration messages
    if (ubxTime) printMessage("UBX SIMULATING TIME");
    else printMessage("UBX NOT SIMULATING TIME");

    char* ubxSourceMessage;
    asprintf(&ubxSourceMessage, "UBX SOURCE: %s", ubxSource);
    printMessage(ubxSourceMessage);
    free(ubxSourceMessage);

    char* ubxIterationsMessage;
    asprintf(&ubxIterationsMessage, "UBX ITERATIONS: %s", ubxIterations == INT_MAX ? "infinite" : ubxIterationsBuff);
    printMessage(ubxIterationsMessage);
    free(ubxIterationsMessage);

    char* gpsInterfaceMessage;
    asprintf(&gpsInterfaceMessage, "GPS INTERFACE: %s", slavepath);
    printMessage(gpsInterfaceMessage);
    free(gpsInterfaceMessage);
    
    while(ubxIterations){
        char* line = NULL;
        size_t len = 0;

        FILE* fp;
        fp = fopen(ubxSource, "r");
        
        if (fp == NULL)
        {
            printError("Error opening file!\n");
            exit(1);
        }
        int t = 0;

        while (t != -1)
        {
            t = getline(&line, &len, fp);
            if (ubxTime) {
                deltaT = getDelta(&previousT, &currentT, line);
                sleep(deltaT);
            }
            int written_bytes = write(gps_port,line,t);
            line = NULL;
            len = 0;
        }

        free(line);
        fclose(fp);

        if (ubxIterations != INT_MAX) ubxIterations--;
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