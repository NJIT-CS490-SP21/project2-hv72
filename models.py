from app import db

class Person(db.Model):
    # id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, primary_key=True)
    # email = db.Column(db.String(120), unique=True, nullable=False)
    userscore = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return '<Person %r>' % self.username