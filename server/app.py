import json
import sys
import csv
from flask import Flask, Response, abort, request, g
app = Flask(__name__)
import logging
logger = app.logger
logger.setLevel(logging.DEBUG)

DATA_FILE = "./data/cashflow.csv"

def readCSV(ban=None):
    with open(DATA_FILE, "rb") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames
        cashflow = [r for r in reader if (ban is None or r["addtime"] != ban)]

    def keyFunc(row):
        return long(row["addtime"])
    cashflow.sort(reverse=True, key=keyFunc)

    total = {
        "Vincent": 0,
        "Cecilia": 0
    }
    for r in cashflow:
        total[r["User"]] += long(r["Amount"])

    return {
        "fieldnames": fieldnames,
        "cashflow": cashflow,
        "v_pay_c": (total["Cecilia"] - total["Vincent"]) / 2.0
    }


@app.route("/load", methods=["GET"])
def load():
    data = readCSV()
    return Response(response=json.dumps(data), mimetype='application/json')

@app.route("/add", methods=["GET"])
def add():
    addtime = request.args.get("addtime")
    user = request.args.get("user")
    date = request.args.get("date")
    amount = request.args.get("amount")
    purpose = request.args.get("purpose")
    if not (user and date and amount and purpose):
        abort(400)

    with open(DATA_FILE, "r") as f:
            reader = csv.DictReader(f)
            fieldnames = reader.fieldnames
    with open(DATA_FILE, "a") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)

        writer.writerow({
            "addtime": addtime,
            "User": user,
            "Date": date,
            "Amount": amount,
            "Purpose": purpose
        })

    data = readCSV()
    return Response(response=json.dumps(data), mimetype='application/json')

@app.route("/delete", methods=["GET"])
def delete():
    addtime = request.args.get("addtime")

    data = readCSV(str(addtime))

    with open(DATA_FILE, "w") as f:
        writer = csv.DictWriter(f, fieldnames=data["fieldnames"])

        writer.writeheader()
        for row in data["cashflow"]:
            writer.writerow(row)

    return Response(response=json.dumps(data), mimetype='application/json')
