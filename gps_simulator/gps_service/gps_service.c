#include "gps_service.h"


/* INTERNAL FUNCTIONS SIGNATURES */

// Allocates and returns a new gps_structure
static gps_struct* gpsNew();
// Skip n times a comma-token and returns the last one
static char* skipTokens(int n);
// Print the gps_struct 
void gpsPrint(gps_struct* data);


/* EXPORTED FUNCTIONS */

int openGPSPort(const char* port) {		//restore to ()
	// Opens the serial port
	int serial_port = open(port, O_RDWR);		//restore to "condition.gps.interface"

	// Handle in case of error
	if(serial_port < 0) {
		//logWarning("Error in opening GPS port");
		perror("Error in opening GPS port\n");
		return -1;
	}

	// Create termios struct to configure port
	struct termios tty;
	memset(&tty, 0, sizeof(tty));

	// Read in existing settings and handle errors
	if(tcgetattr(serial_port, &tty) != 0) {
		//logWarning("Error in GPS tcgetattr");
		printf("Error in GPS tcgetattr\n");
		return -1;
	}

	// the c_cflags member of the termios contains control fields
	tty.c_cflag &= ~PARENB;				// disable parity bit
	tty.c_cflag &= ~CSTOPB;				// clear stop field
	tty.c_cflag |= CS8;					// 8 data bits per byte
	tty.c_cflag &= ~CRTSCTS;			// disable TRS/CTS hardware flow control
	tty.c_cflag |= CREAD | CLOCAL;		// turn on READ and ignore control lines, setting CLOCAL allows us to read data
	// local modes
	tty.c_lflag &= ~ICANON;		// disable canonical mode, in canonical mode input data is received line by line, usually undesired when dealing with serial ports
	tty.c_lflag &= ~ECHO;		// if this bit (ECHO) is set, sent characters will be echoed back.
	tty.c_lflag &= ~ECHOE;
	tty.c_lflag &= ~ECHONL;
	tty.c_lflag &= ~ISIG;		// when the ISIG bit is set, INTR,QUIT and SUSP characters are interpreted. we don't want this with a serial port
	// the c_iflag member of the termios struct contains low-level settings for input processing. the c_iflag member is an int
	tty.c_iflag &= ~(IXON | IXOFF | IXANY);											// clearing IXON,IXOFF,IXANY disable software flow control
	tty.c_iflag &= ~(IGNBRK | BRKINT | PARMRK | ISTRIP | INLCR | IGNCR | ICRNL);	// clearing all of this bits disable any special handling of received bytes, i want raw data
	// output modes (c_oflag). the c_oflag member of the termios struct contain low level settings for output processing, we want to disable any special handling of output chars/bytes
	tty.c_oflag &= ~OPOST;		// prevent special interpretation of output bytes
	tty.c_oflag &= ~ONLCR;		// prevent conversion of newline to carriage return/line feed
	// setting VTIME VMIN
	tty.c_cc[VTIME] = 10;		// read() will block until either any amount of data is received or the timeout ocurs
	tty.c_cc[VMIN] = 0;

	// Setting baud rate
	cfsetispeed(&tty, B460800);
	cfsetospeed(&tty, B460800);

	// After changing settings we need to save the tty termios struct, also error checking
	if(tcsetattr(serial_port, TCSANOW, &tty) != 0) {
		//logWarning("Error in GPS tcsetattr");
		printf("Error in saving the termios struct");
		return -1;
	}

	return serial_port;
}

gps_struct* readGPS(int serial_port) { 
	// Instantiate and fill the buffer
	char read_buf[1024];
	memset(&read_buf,'\0',sizeof(read_buf));
	
	// Get size in bytes and handle errors;
	int num_bytes = read(serial_port, &read_buf, sizeof(read_buf));
	if(num_bytes < 0){
		//logWarning("GPS not reading");
		return NULL;
	}

	// Initialize token
	char *token;
	token = strtok(read_buf,"\n");

	// Initialize the gps_struct and initialize it parsing the message
	gps_struct *result = gpsNew();
	while (token != NULL) {
		if (strstr(token, "GGA")){
			result->gga = parseGGA(token);
		}
		else if (strstr(token, "GLL")){
			result->gll = parseGLL(token);
		}
		else if (strstr(token, "VTG")){
			result->vtg = parseVTG(token);
		}
		else if (strstr(token, "RMC")){
			result->rmc = parseRMC(token);
		}
		token = strtok(NULL,"\n");
	}

	gpsPrint(result);

	return result;
}

void gpsFree(gps_struct* gps_data) {
	free(gps_data->gga);
	free(gps_data->gll);
	free(gps_data->vtg);
	free(gps_data->rmc);
	free(gps_data);
}

gps_gga_struct* parseGGA(char *message) {
	gps_gga_struct* result = (gps_gga_struct*) malloc(sizeof(gps_gga_struct));

	char *token;
	token = strtok(message,",");
	token = skipTokens(1);
	result->utc_time = (token == NULL ? "" : strdup(token));
	token = skipTokens(1);
	result->latitude = (token == NULL ? 0.0 : atof(token));
	token = skipTokens(1);
	result->ns_indicator = (token == NULL ? "" : strdup(token));
	token = skipTokens(1);
	result->longitude = (token == NULL ? 0.0 : atof(token));
	token = skipTokens(1);
	result->ew_indicator = (token == NULL ? "" : strdup(token));
	token = skipTokens(1);
	result->status = (token == NULL ? 0 : atoi(token));
	token = skipTokens(3);
	result->altitude = (token == NULL ? 0.0 : atof(token));

	return result;
}

gps_gll_struct* parseGLL(char *message) {
	gps_gll_struct* result = (gps_gll_struct*) malloc(sizeof(gps_gll_struct));

	char *token;
	token = strtok(message,",");
	token = skipTokens(1);
	result->latitude = (token == NULL ? 0.0 : atof(token));
	token = skipTokens(1);
	result->ns_indicator = (token == NULL ? "" : strdup(token));
	token = skipTokens(1);
	result->longitude = (token == NULL ? 0.0 : atof(token));
	token = skipTokens(1);
	result->ew_indicator = (token == NULL ? "" : strdup(token));
	token = skipTokens(1);
	result->utc_time = (token == NULL ? "" : strdup(token));
	token = skipTokens(1);
	result->status = (token == NULL ? 0 : (strcmp("A", token) == 0));
	
	return result;
}

gps_vtg_struct* parseVTG(char *message) {
	gps_vtg_struct* result = (gps_vtg_struct*) malloc(sizeof(gps_vtg_struct));

	char *token;
	token = strtok(message,",");
	token = skipTokens(3);
	result->ground_speed_knots = (token == NULL ? 0.0 : atof(token));
	token = skipTokens(2);
	result->ground_speed_human = (token == NULL ? 0.0 : atof(token));
	
	return result;
}

gps_rmc_struct* parseRMC(char *message) {
	gps_rmc_struct* result = (gps_rmc_struct*) malloc(sizeof(gps_rmc_struct));

	char *token;
	token = strtok(message,",");
	token = skipTokens(1);
	result->utc_time = (token == NULL ? "" : strdup(token));
	token = skipTokens(1);
	result->status = (token == NULL ? 0 : (strcmp("A", token) == 0));
	token = skipTokens(1);
	result->latitude = (token == NULL ? 0.0 : atof(token));
	token = skipTokens(1);
	result->ns_indicator = (token == NULL ? "" : strdup(token));
	token = skipTokens(1);
	result->longitude = (token == NULL ? 0.0 : atof(token));
	token = skipTokens(1);
	result->ew_indicator = (token == NULL ? "" : strdup(token));
	token = skipTokens(1);
	result->ground_speed_knots = (token == NULL ? 0.0 : atof(token));
	token = skipTokens(1);
	result->date = (token == NULL ? "" : strdup(token));

	return result;
}


/* INTERNAL FUNCTIONS DEFINITIONS */

void gpsPrint(gps_struct* data) {
	if (data->gga != NULL) {
		printf("gga->latitude\t%f\n", data->gga->latitude);
		printf("gga->longitude\t%f\n", data->gga->longitude);
		printf("gga->altitude\t%f\n", data->gga->altitude);
		printf("gga->ns_indicator\t%s\n", data->gga->ns_indicator);
		printf("gga->ew_indicator\t%s\n", data->gga->ew_indicator);
		printf("gga->utc_time\t%s\n", data->gga->utc_time);
		printf("gga->status\t%d\n", data->gga->status);
	}
	if (data->gll != NULL) {
		printf("gll->latitude\t%f\n", data->gll->latitude);
		printf("gll->longitude\t%f\n", data->gll->longitude);
		printf("gll->ns_indicator\t%s\n", data->gll->ns_indicator);
		printf("gll->ew_indicator\t%s\n", data->gll->ew_indicator);
		printf("gll->utc_time\t%s\n", data->gll->utc_time);
		printf("gll->status\t%d\n", data->gll->status);
	}
	if (data->vtg != NULL) {
		printf("vtg->ground_speed_knots\t%f\n", data->vtg->ground_speed_knots);
		printf("vtg->ground_speed_human\t%f\n", data->vtg->ground_speed_human);
	}
	if (data->rmc != NULL) {
		printf("rmc->latitude\t%f\n", data->rmc->latitude);
		printf("rmc->longitude\t%f\n", data->rmc->longitude);
		printf("rmc->ground_speed_knots\t%f\n", data->rmc->ground_speed_knots);
		printf("rmc->ns_indicator\t%s\n", data->rmc->ns_indicator);
		printf("rmc->ew_indicator\t%s\n", data->rmc->ew_indicator);
		printf("rmc->utc_time\t%s\n", data->rmc->utc_time);
		printf("rmc->date\t%s\n", data->rmc->date);
		printf("rmc->status\t%d\n", data->rmc->status);
	}
}


static gps_struct* gpsNew() {
	gps_struct* result = (gps_struct*) malloc(sizeof(gps_struct));
	
	result->gga = NULL;
	result->gll = NULL;
	result->vtg = NULL;
	result->rmc = NULL;

	return result;
}

static char* skipTokens(int n) {
	--n;
	for (int i = 0; i < n; ++i) {
		strtok(NULL,",");
	}
	return strtok(NULL,",");
}


