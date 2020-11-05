#ifndef TELEMETRY_GPS_SERVICE
#define TELEMETRY_GPS_SERVICE

/* IMPORTS */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <fcntl.h>
#include <errno.h>
#include <termios.h>
#include <unistd.h>

/* TYPES */

typedef struct {
	double latitude;
	double longitude;
	double altitude;
	char* ns_indicator;
	char* ew_indicator;
	char* utc_time;
	int status;
} gps_gga_struct;

typedef struct {
	double latitude;
	double longitude;
	char* ns_indicator;
	char* ew_indicator;
	char* utc_time;
	int status;
} gps_gll_struct;

typedef struct {
	double ground_speed_knots;
	double ground_speed_human;
} gps_vtg_struct;

typedef struct {
	double latitude;
	double longitude;
	char* ns_indicator;
	char* ew_indicator;
	char* utc_time;
	char* date;
	int status;
	double ground_speed_knots;
} gps_rmc_struct;

typedef struct {
	gps_gga_struct *gga;
	gps_gll_struct *gll;
	gps_vtg_struct *vtg;
	gps_rmc_struct *rmc;
} gps_struct;

/* FUNCTIONS */

/**
 * Opens and returns the gps port
 * @return The serial port
*/ 
int openGPSPort(const char* port);

/**
 * Reads data from the gps serial port and returns it as a structured object
 * @return The parsed data as a gps_struct object pointer
*/ 
gps_struct* readGPS(int serial_port);

/**
 * Deallocates the given gps_struct object
 * @param The gps_struct object that is to be deallocated
*/ 
void gpsFree(gps_struct* gps_data);

/**
 * 	Parse the NMEA line into gps__gga_struct
 * @param the line to convert to struct
*/
 gps_gga_struct* parseGGA(char *message);

 /**
 * 	Parse the NMEA line into gps__gll_struct
 * @param the line to convert to struct
*/
 gps_gll_struct* parseGLL(char *message);

 /**
 * 	Parse the NMEA line into gps__rmc_struct
 * @param the line to convert to struct
*/
 gps_rmc_struct* parseRMC(char *message);

/**
 * 	Parse the NMEA line into gps__vtg_struct
 * @param the line to convert to struct
*/
 gps_vtg_struct* parseVTG(char *message);
#endif


