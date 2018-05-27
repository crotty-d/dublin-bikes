from flask import render_template, jsonify
from application import app
from application import analysis

@app.route('/')
def index():
	return render_template("index.html")


@app.route('/station_stats/<int:station_num>')
def get_chart_data(station_num):
	"""REST API response providing json file with data for charts"""
	
	# Get data from analysis functions and structure for jsonify (dictionary of dictionaries)
	data = {'daily_avg': analysis.get_daily_avg(station_num), 'hourly_avg': analysis.get_hourly_avg(station_num), 'weather': analysis.get_weather(station_num)}
	
	# Return JSON file as HTTP response
	return jsonify(station_stats=data)