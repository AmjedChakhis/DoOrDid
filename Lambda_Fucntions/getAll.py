import json
import boto3
from decimal import Decimal
from boto3.dynamodb.types import TypeDeserializer

dynamoDB = boto3.client('dynamodb')

# Helper function to convert DynamoDB items to a JSON serializable format
def deserialize_item(item):
    deserializer = TypeDeserializer()
    return {k: deserialize_value(deserializer.deserialize(v)) for k, v in item.items()}

def deserialize_value(value):
    if isinstance(value, Decimal):
        if value % 1 == 0:
            return int(value)
        else:
            return float(value)
    elif isinstance(value, list):
        return [deserialize_value(v) for v in value]
    elif isinstance(value, dict):
        return {k: deserialize_value(v) for k, v in value.items()}
    return value

def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
    }

    try:
        response = dynamoDB.scan(TableName='my_todo')

        if 'Items' not in response:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps('No Todo items found')
            }

        items = [deserialize_item(item) for item in response['Items']]
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(items)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': 'Error retrieving Todo items', 'error': str(e)})
        }
