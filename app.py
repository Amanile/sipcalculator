from flask import Flask, render_template, request, jsonify
import math

app = Flask(__name__)

def calculate_sip(monthly_investment, years, expected_return):
    monthly_rate = expected_return / (12 * 100)
    months = years * 12
    
    # Calculate future value of SIP
    future_value = monthly_investment * ((math.pow(1 + monthly_rate, months) - 1) / monthly_rate) * (1 + monthly_rate)
    
    # Calculate total investment
    total_investment = monthly_investment * months
    
    # Calculate wealth gained
    wealth_gained = future_value - total_investment
    
    return {
        'future_value': round(future_value, 2),
        'total_investment': round(total_investment, 2),
        'wealth_gained': round(wealth_gained, 2)
    }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/mutual-funds')
def mutual_funds():
    return render_template('mutual_funds.html')

@app.route('/sip-vs-lumpsum')
def sip_vs_lumpsum():
    return render_template('sip_vs_lumpsum.html')

@app.route('/sip-vs-swp')
def sip_vs_swp():
    return render_template('sip_vs_swp.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    monthly_investment = float(data['monthly_investment'])
    years = int(data['years'])
    expected_return = float(data['expected_return'])
    
    result = calculate_sip(monthly_investment, years, expected_return)
    return jsonify(result)

# For local development
if __name__ == '__main__':
    app.run(debug=True)

# For Vercel deployment
app = app 