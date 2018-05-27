"""Functions used by get_chart_data(station_num) in views.py TODO: Needs to be completed"""

from application import db

def get_daily_avg(station_num):
    """Returns daily average data for REST API response providing json file with data for charts"""
    
    # MySQL query to get average daily availability for a given station
    sql_daily = """SELECT DAYNAME(update_time) AS 'day', ROUND(AVG(bikes_available)) AS 'bikes'
    FROM bikesdata.stations
    WHERE station_number = {}
    GROUP BY DAYNAME(update_time);""".format(station_num)
    
         
    # Execute SQL query for daily averages
    result = db.engine.execute(sql_daily) # result is a RowProxy
    
    # Get data from queries and structure for JSON file (dictionary)
    data = {}
    
    for row in result:
        data[row['day']] = row['bikes'] # Note each row in RowProxy is dictionary: {col_name: col_value_for_row}
        
    return data


def get_hourly_avg(station_num):
    """Returns daily average data for REST API response providing JSON file with data for charts"""
    
    # MySQL query to get average hourly availability for a given station
    sql = """SELECT DAYNAME(update_time) AS day, ROUND(AVG(bikes_available)) AS available
    FROM bikesdata.stations
    WHERE HOUR(update_time) > 3 AND station_number = {} 
    GROUP BY DAYNAME(update_time), HOUR(update_time);""".format(station_num) #TODO: Add query
    
    # Execute SQL query for hourly averages
    result = db.engine.execute(sql) # result is a RowProxy
    
    # Get data from queries and structure for JSON file (dictionary of lists)
    
    #- Lists to hold hourly averages of availability
    mondayData = []
    tuesdayData = []
    wednesdayData = []
    thursdayData = []
    fridayData = []
    saturdayData = []
    sundayData = []
    
    #- Populate lists with corresponding values from result
    for row in result:
        if row['day'] == 'Monday':
            mondayData.append(row['available'])
        elif row['day'] == 'Tuesday':
            tuesdayData.append(row['available'])
        elif row['day'] == 'Wednesday':
            wednesdayData.append(row['available'])
        elif row['day'] == 'Thursday':
            thursdayData.append(row['available'])
        elif row['day'] == 'Friday':
            fridayData.append(row['available'])
        elif row['day'] == 'Saturday':
            saturdayData.append(row['available'])
        else:
            sundayData.append(row['available'])
            
    #- Populate output dictionary with lists of hourly averages from result            
    data = {'Monday':mondayData,'Tuesday':tuesdayData,'Wednesday':wednesdayData,'Thursday':thursdayData,'Friday':fridayData,'Saturday':saturdayData,'Sunday':sundayData}
            
    return data

#TODO
def get_weather(station_num):
    """
    Returns daily average data under different weather conditions.
    For REST API response providing json file with data for charts
    """

    
    # MySQL query to get average hourly availability for a given station
    sql = """replace this with SQL query for specified station number {};""".format(station_num) #TODO: Add query
    
    # Execute SQL query for weather
#     result = db.engine.execute(sql) # result is a RowProxy
    
    # Get data from queries and structure for JSON file (dictionary)
    data = {}
    
    # Add code to populate dictionary from result
            
    return data

