"""Agrega rol a usuarios (superadmin / psicologo).

Revision ID: 20260911_01
Revises: 20260910_01
Create Date: 2026-09-11
"""

from alembic import op
import sqlalchemy as sa


revision = "20260911_01"
down_revision = "20260910_01"
branch_labels = None
depends_on = None


rol_usuario = sa.Enum("SUPERADMIN", "PSICOLOGO", name="rolusuario")


def upgrade() -> None:
    rol_usuario.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "usuarios",
        sa.Column("rol", rol_usuario, nullable=False, server_default="PSICOLOGO"),
    )


def downgrade() -> None:
    op.drop_column("usuarios", "rol")
    rol_usuario.drop(op.get_bind(), checkfirst=True)
