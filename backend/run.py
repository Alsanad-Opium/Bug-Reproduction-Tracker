from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug = True)
    
    
    
## These lines below as for database initializationa and migration, you can run them once to create the database and then comment them out or remove them.

# flask --app run.py db init
# flask --app run.py db migrate -m "initial migration"
# flask --app run.py db upgrade    