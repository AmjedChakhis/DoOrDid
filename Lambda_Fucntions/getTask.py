import json
import boto3
from botocore.exceptions import ClientError

dynamoDB = boto3.client('dynamodb')

def lambda_handler(event, context):
    headers = {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET"
    }

    try:
        # Print the incoming event for debugging purposes
        print('Event:', json.dumps(event))

        query_params = event.get('queryStringParameters', {})
        id = query_params.get('id')

        # Print the extracted query parameters
        print('Query Parameters:', query_params)
        print('ID:', id)

        if not id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'message': 'Invalid request format. Query parameter "id" is missing.',
                    'query_parameters': query_params
                });
            }
            

        params = {
            'TableName': 'my_todo',
            'Key': {
                'id': {'N': id}
            }
        }

        response = dynamoDB.get_item(**params)

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'message': 'Todo item not found'})
            }

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps(response['Item'])
        }
    except ClientError as e:
        print('ClientError:', e)
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'message': 'Error retrieving Todo item', 'error': str(e)})
        }

