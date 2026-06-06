
import click
from app import create_app
from app.extensions import db
from app.models.admin import Admin
from app.utils.auth_helpers import hash_password

app = create_app()


# ─── Seed Command ─────────────────────────────────────────────────────────────

@app.cli.command('seed')
def seed_super_admin():
    """
    Seed the database with the default Super Admin account.
    Run once after migration:  flask --app run seed
    """
    email = 'admin@system.com'

    existing = Admin.query.filter_by(email=email).first()
    if existing:
        click.echo('⚠️  Super Admin already exists. Skipping seed.')
        return

    super_admin = Admin(
        civility      = 'Mr',
        first_name    = 'Super',
        last_name     = 'Admin',
        email         = email,
        phone         = '+1000000000',
        role          = 'super_admin',
        status        = 'active',
        password_hash = hash_password('Admin123!')
    )

    db.session.add(super_admin)
    db.session.commit()

    click.echo('✅ Super Admin seeded successfully!')
    click.echo('─────────────────────────────────')
    click.echo(f'  📧 Email   : {email}')
    click.echo(f'  🔑 Password: Admin123!')
    click.echo('─────────────────────────────────')
    click.echo('⚠️  Change this password after first login.')


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == '__main__':
    app.run(debug=True, port=5000)