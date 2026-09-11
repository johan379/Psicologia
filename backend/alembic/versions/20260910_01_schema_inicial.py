"""Esquema inicial: usuarios, pacientes, sesiones y auditoría.

Revision ID: 20260910_01
Revises:
Create Date: 2026-09-10
"""

from alembic import op
import sqlalchemy as sa


revision = "20260910_01"
down_revision = None
branch_labels = None
depends_on = None


estado_proceso = sa.Enum("ACTIVO", "EN_PAUSA", "FINALIZADO", name="estadoproceso")


def upgrade() -> None:
    op.create_table(
        "usuarios",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("correo", sa.String(150), nullable=False, unique=True),
        sa.Column("contrasena_hash", sa.String(255), nullable=False),
        sa.Column("activo", sa.Boolean(), nullable=False, server_default=sa.true()),
    )
    op.create_index("ix_usuarios_correo", "usuarios", ["correo"])

    op.create_table(
        "pacientes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("nombre_completo", sa.String(200), nullable=False),
        sa.Column("documento_identidad", sa.String(50), nullable=True),
        sa.Column("fecha_nacimiento", sa.Date(), nullable=True),
        sa.Column("telefono", sa.String(30), nullable=True),
        sa.Column("email", sa.String(150), nullable=True),
        sa.Column("fecha_ingreso", sa.Date(), nullable=False),
        sa.Column("motivo_consulta", sa.Text(), nullable=False),
        sa.Column("estado_proceso", estado_proceso, nullable=False, server_default="ACTIVO"),
        sa.Column("observaciones_generales", sa.Text(), nullable=True),
        sa.Column("creado_por_id", sa.Integer(), sa.ForeignKey("usuarios.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_pacientes_nombre_completo", "pacientes", ["nombre_completo"])
    op.create_index("ix_pacientes_documento_identidad", "pacientes", ["documento_identidad"])

    op.create_table(
        "sesiones",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("paciente_id", sa.Integer(), sa.ForeignKey("pacientes.id"), nullable=False),
        sa.Column("numero_sesion", sa.Integer(), nullable=False),
        sa.Column("fecha", sa.DateTime(), nullable=False),
        sa.Column("motivo_tema", sa.String(255), nullable=False),
        sa.Column("descripcion_notas", sa.Text(), nullable=False),
        sa.Column("observaciones", sa.Text(), nullable=True),
        sa.Column("intervenciones_realizadas", sa.Text(), nullable=True),
        sa.Column("evolucion_paciente", sa.Text(), nullable=True),
        sa.Column("tareas_recomendaciones", sa.Text(), nullable=True),
        sa.Column("notas_adicionales", sa.Text(), nullable=True),
        sa.Column("creado_por_id", sa.Integer(), sa.ForeignKey("usuarios.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_sesiones_paciente_id", "sesiones", ["paciente_id"])

    op.create_table(
        "registros_auditoria",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("usuario_id", sa.Integer(), sa.ForeignKey("usuarios.id"), nullable=True),
        sa.Column("accion", sa.String(50), nullable=False),
        sa.Column("entidad", sa.String(50), nullable=False),
        sa.Column("entidad_id", sa.Integer(), nullable=True),
        sa.Column("detalle", sa.Text(), nullable=True),
        sa.Column("fecha", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("registros_auditoria")
    op.drop_index("ix_sesiones_paciente_id", table_name="sesiones")
    op.drop_table("sesiones")
    op.drop_index("ix_pacientes_documento_identidad", table_name="pacientes")
    op.drop_index("ix_pacientes_nombre_completo", table_name="pacientes")
    op.drop_table("pacientes")
    op.drop_index("ix_usuarios_correo", table_name="usuarios")
    op.drop_table("usuarios")
    estado_proceso.drop(op.get_bind(), checkfirst=True)
