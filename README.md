# Achievers Management Web App

Achievers Management Web App is an application made to:

- enroll new users
- manage mentors and mentees
- connect mentors with mentees
- view mentors' rosters and manage mentors' calendar
- manage mentees' sessions and reports

## Installation

- Install docker from here: https://www.docker.com/products/docker-desktop/
- Open a terminal/command line and type:

```bash
docker pull mysql
```

- On the terminal again type:

```bash
docker run -p 3306:3306 --name achievers-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw -d mysql:latest mysqld --lower_case_table_names=1
```

- Install nodejs LTS version from here: https://nodejs.org/en

- On a terminal pointing the achiever project, type:

```bash
npm install
```

- Rename the .env.example file to .env and fill the require values

## Usage

The application will run at: http://localhost:3000/

## Run migrations

Update the `schema.prisma` file in the prisma folder to update the database schema.

Run this command to apply the migrations locally:

```bash
npx prisma migrate dev --name {name}
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
