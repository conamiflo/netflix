import datetime
import math
import json
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Attr

# Initialize the DynamoDB resource
dynamodb = boto3.resource('dynamodb')
feed_table = dynamodb.Table('feed-table')
movies_table = dynamodb.Table('movies-dbtable2')


def get_feed(event, context):
    try:
        username = event['queryStringParameters']['username']
        print(f"Fetching feed for user: {username}")

        response = feed_table.get_item(Key={'username': username})
        print(f"Feed table response: {response}")

        feed_item = response.get('Item')

        if not feed_item or 'feed' not in feed_item:
            print(f"No feed found for user {username}. Fetching random movies instead.")
            scan_response = movies_table.scan()
            movie_items = scan_response.get('Items', [])

            random_movies = movie_items[:9]

            for movie in random_movies:
                movie['movie_size'] = str(movie['movie_size'])
                movie['movie_modified'] = str(movie['movie_modified'])

            return {
                'statusCode': 200,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'movies': random_movies})
            }

        feed_movie_ids = feed_item['feed']
        print(f"Feed movie IDs: {feed_movie_ids}")

        movies = []
        for movie_id in feed_movie_ids:
            print(f"Fetching movie with ID: {movie_id}")
            response = movies_table.query(
                KeyConditionExpression=boto3.dynamodb.conditions.Key('movie_id').eq(movie_id)
            )
            print(f"Movies table response for ID {movie_id}: {response}")

            movie_items = response.get('Items', [])
            for movie_item in movie_items:
                movie_item['movie_size'] = str(movie_item['movie_size'])
                movie_item['movie_modified'] = str(movie_item['movie_modified'])
                movies.append(movie_item)
                print(f"Added movie: {movie_item}")

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'movies': movies})
        }
    except ClientError as e:
        print(f"ClientError: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': str(e)})
        }
    except Exception as e:
        print(f"Exception: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': str(e)})
        }