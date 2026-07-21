# RentRadar — Pune Rental Price Predictor

A small Flask app that estimates fair monthly rent for residential
properties in a few Pune localities (Bibwewadi, Kondhwa, Balaji Nagar,
Sukhsagar Nagar), using a trained scikit-learn pipeline (`model.pkl`).

## Project structure

```
VIT_Rendar_House_Predicting_System/
├── app.py                 # Flask app + prediction API
├── model.pkl              # Trained scikit-learn pipeline
├── requirements.txt
├── templates/
│   └── index.html         # Main page (Jinja template)
└── static/
    ├── css/style.css      # Styling
    └── js/main.js         # Form logic + API calls
```

## Running locally

```bash
python -m venv venv
source venv/bin/activate      # venv\Scripts\activate on Windows
pip install -r requirements.txt
python app.py
```

Then open http://localhost:5000 in your browser.

## API

`POST /predict` — accepts a JSON body describing the property and returns:

```json
{
  "success": true,
  "predicted_rent": 18500,
  "rent_range": { "low": 17020, "high": 19980 },
  "rate_per_sqft": 33.6
}
```

`GET /health` — reports whether the model loaded successfully, useful for
deployment checks.

## Notes

- Dropdown options in the UI are generated server-side from `FIELD_OPTIONS`
  in `app.py`, so the form can never send a category the model doesn't
  recognise.
- The predicted figure is rounded to the nearest ₹100 and shown alongside a
  ±8% range, since a model estimate shouldn't be presented as more precise
  than it is.
