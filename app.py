from flask import Flask, request, jsonify, render_template
import joblib
import pandas as pd
import traceback

app = Flask(__name__)

# Load the trained machine learning model
MODEL_PATH = "model.pkl"
try:
    model = joblib.load(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json() 
        
        # 1. Capture the raw input data
        input_data = {
            'search_locality': data.get('search_locality'),
            'property_type': data.get('property_type'),
            'bhk': int(data.get('bhk')),
            'area_sqft': float(data.get('area_sqft')),
            'floor_current': float(data.get('floor_current')),
            'bathrooms': float(data.get('bathrooms')),
            'balcony': float(data.get('balcony')),
            'furnishing': data.get('furnishing'),
            'tenant_preference': data.get('tenant_preference'),
            'water_supply': data.get('water_supply'),
            'facing': data.get('facing'),
            'non_veg_allowed': 'Yes' if data.get('non_veg_allowed') else 'No',
            'negotiable': 'True' if data.get('negotiable') else 'False'
        }

        # 2. Convert to DataFrame
        input_df = pd.DataFrame([input_data])
        
        # 3. Convert text columns to Dummy Variables (One-Hot Encoding)
        input_df = pd.get_dummies(input_df)

        # 4. Force the DataFrame to match the model's exact expected columns
        expected_columns = model.feature_names_in_
        final_features = input_df.reindex(columns=expected_columns, fill_value=0)
        
        # 5. Predict using the exact model
        predicted_rent = float(model.predict(final_features)[0])
        predicted_rent = max(predicted_rent, 0) # Ensure no negative rent

        # 6. Calculate a strict +/- 8% range based on the exact value
        low_estimate = predicted_rent * 0.92
        high_estimate = predicted_rent * 1.08

        # Return the EXACT values
        return jsonify({
            "success": True,
            "predicted_rent": predicted_rent, 
            "rent_range": {
                "low": low_estimate,
                "high": high_estimate
            }
        })

    except Exception as exc:
        print("[predict] error:", traceback.format_exc())
        return jsonify({"success": False, "error": f"Prediction failed: {exc}"}), 500

if __name__ == '__main__':
    app.run(debug=True)