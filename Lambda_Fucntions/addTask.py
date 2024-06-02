import json
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.types import Decimal

dynamoDB = boto3.client('dynamodb')

# Custom encoder to handle Decimal types
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

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

        items = response['Items']
        
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(items, cls=DecimalEncoder)
        }
    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': 'Error retrieving Todo items', 'error': e.response['Error']['Message']})
        }
