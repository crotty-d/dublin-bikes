#!/usr/bin/python

"""Module to get data from external APIs and insert it into a database"""

# External libraries
import requests
import json
import sqlalchemy as sa
import sys
# Database and external API details
import config


# -- Functions --
def get_json_data(url):
    """Gets JSON file from URL and converts it to Python object comprising a list of lists and dictionaries"""
    try:   
        # Get json file
        response = requests.get(url)
        response.raise_for_status()
    except requests.exceptions.HTTPError as errh:
        print ("Http error while getting JSON file:",errh)
    except requests.exceptions.ConnectionError as errc:
        print ("Error connecting while getting JSON file:",errc)
    except requests.exceptions.Timeout as errt:
        print ("Timeout error while getting JSON file:",errt)
    except requests.exceptions.RequestException as err:
        print (err)
    else:
        return response.json()

def station_data_to_DB(json_file, DB_uri: str):
    """Inserts bike station data from json file as rows in the MySQL databases"""
    if json_file is not None:    
        # Create MySQL DB engine object
        engine = sa.create_engine(DB_uri)
        
        # Connect to DB via engine and perform transaction on DB (rolls back if error)
        with engine.begin() as connection:
            
            # Get required values for each station and insert into DB
            for station in json_file:
                    
                # Create SQL values list to insert into query
                values = str(station['number']) + ', FROM_UNIXTIME({})'.format(station['last_update']//1000) # make string with sql time conversion applied
                values += ", '{}'".format(station['name'].replace("'","''")) # escape apostrophes for sql query
                values += ", '{}'".format(station['address'].replace("'","''")) # escape apostrophes for sql query
                values += ', ' + str(station['available_bikes']) + ', ' + str(station['available_bike_stands']) 
                values += ', ' + str(station['bike_stands']) + ', ' + "'{}'".format(station['status'])
                values += ', ' + str(station['banking']) + ', ' + str(station['position']['lat']) + ', ' + str(station['position']['lng'])
                
                # Execute SQL query to insert station values as a row
                sql = "INSERT INTO bikesdata.stations VALUES ({});".format(values)
                print(sql)
                connection.execute(sql)
                                
        print('Transaction completed.')
        
    else:
        print('Error: No json file object received by {}'.format(station_data_to_DB.__name__))
        
def weather_data_to_DB(json_file, DB_uri: str):
    """Inserts weather data from json file as rows in the MySQL databases"""
    # Create MySQL DB engine object
    engine = sa.create_engine(DB_uri)
    
    # Connect to DB via engine and perform transaction on DB (rolls back if error)
    with engine.begin() as connection:
        j = json_file  
        # Create SQL values list to insert into query
        values = 'FROM_UNIXTIME({})'.format(j['dt']) # make string with sql time conversion applied
        values += ', ' + str(j['weather'][0]['id']) + ', ' + "'{}'".format(j['weather'][0]['main']) 
        values += ', ' + "'{}'".format(j['weather'][0]['description']) + ', ' + "'{}'".format(j['weather'][0]['icon'])
        values += ', ' + str(j['main']['temp']) + ', ' + str(j['main']['pressure'])
        values += ', ' + str(j['main']['humidity']) + ', ' + str(j['main']['temp_min'])
        values += ', ' + str(j['main']['temp_max']) + ', ' + str(j['wind']['speed'])
        values += ', ' + str(j['wind']['deg']) + ', ' + str(j['clouds']['all'])

        
        # Execute SQL query to insert station values as a row
        sql = "INSERT INTO bikesdata.weather VALUES ({});".format(values)
        print(sql)
        connection.execute(sql)
        
    print('Transaction completed.')
  
def write_json_file(json_file, filepath: str):
    """Writes latest data to json file which can then be accessed by frontend JavaScript"""
    if json_file is not None:
        with open(filepath, 'w') as f:
            json.dump(json_file, f, ensure_ascii=False)
    else:
        print('Error: No json file object received by {}'.format(write_json_file.__name__))

def main(which_data:str):
    """
    Get data from external API and inserts it into databse.
    
    The which_data parameter determines which kind of data (API) to get
    and the corresponding DB table in which to insert it.
    Possible values are 'stations' and 'weather'.
    """    
    if which_data == 'stations':    
        # Get json data via api request and insert into DB
        station_json = get_json_data(config.JCD_STATION_DATA_URI)
        station_data_to_DB(station_json, config.SQLALCHEMY_DATABASE_URI)
        # Write latest data to json files in the static directory of the flask app       
        write_json_file(station_json, config.LATEST_STATION_DATA_PATH)
    elif which_data == 'weather':
        # Get json data via api request and insert into DB
        weather_json = get_json_data(config.WEATHER_DATA_URI)
        weather_data_to_DB(weather_json, config.SQLALCHEMY_DATABASE_URI)
        # Write latest data to json files in the static directory of the flask app       
        write_json_file(weather_json, config.LATEST_WEATHER_DATA_PATH)
    else:
        print('A valid argument must be provided to specify the data being retrieved')
    
    
# -- Main --    
if __name__ == '__main__':
    # Receive command line argument and execute corresponding code
    cli_argument = str(sys.argv[1])
    main(cli_argument)
    sys.exit()
