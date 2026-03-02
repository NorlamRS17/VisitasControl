"""Initial migration - crear tablas base

Revision ID: 001_initial
Revises: 
Create Date: 2026-02-28

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Tabla usuarios
    op.create_table(
        'usuarios',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('nombre', sa.String(length=100), nullable=False),
        sa.Column('rol', sa.String(length=20), server_default='operador', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_usuarios_email'), 'usuarios', ['email'], unique=True)
    op.create_index(op.f('ix_usuarios_id'), 'usuarios', ['id'], unique=False)

    # Tabla clientes
    op.create_table(
        'clientes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('nombre_empresa', sa.String(length=200), nullable=False),
        sa.Column('contacto', sa.String(length=100), nullable=True),
        sa.Column('telefono', sa.String(length=20), nullable=True),
        sa.Column('direccion', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_clientes_id'), 'clientes', ['id'], unique=False)
    op.create_index(op.f('ix_clientes_nombre_empresa'), 'clientes', ['nombre_empresa'], unique=False)

    # Tabla visitas
    op.create_table(
        'visitas',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('id_cliente', sa.Integer(), nullable=False),
        sa.Column('id_visitante', sa.Integer(), nullable=False),
        sa.Column('fecha_visita', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('observaciones', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['id_cliente'], ['clientes.id'], ),
        sa.ForeignKeyConstraint(['id_visitante'], ['usuarios.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_visitas_id'), 'visitas', ['id'], unique=False)

    # Tabla compromisos
    op.create_table(
        'compromisos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('id_visita', sa.Integer(), nullable=False),
        sa.Column('titulo', sa.String(length=200), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('fecha_entrega', sa.Date(), nullable=True),
        sa.Column('estado', sa.String(length=20), server_default='pendiente', nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['id_visita'], ['visitas.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_compromisos_id'), 'compromisos', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_compromisos_id'), table_name='compromisos')
    op.drop_table('compromisos')
    op.drop_index(op.f('ix_visitas_id'), table_name='visitas')
    op.drop_table('visitas')
    op.drop_index(op.f('ix_clientes_nombre_empresa'), table_name='clientes')
    op.drop_index(op.f('ix_clientes_id'), table_name='clientes')
    op.drop_table('clientes')
    op.drop_index(op.f('ix_usuarios_id'), table_name='usuarios')
    op.drop_index(op.f('ix_usuarios_email'), table_name='usuarios')
    op.drop_table('usuarios')
