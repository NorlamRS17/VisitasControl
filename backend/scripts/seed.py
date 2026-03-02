"""
Script para poblar la base de datos con datos de prueba.
Ejecutar: python -m scripts.seed
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models import Usuario, Cliente, Visita, Compromiso
from datetime import datetime, timedelta


def seed_database():
    """Crea datos de prueba en la base de datos."""
    
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        existing_user = db.query(Usuario).filter(Usuario.email == "admin@vccontrol.com").first()
        if existing_user:
            print("La base de datos ya tiene datos. Saltando seed.")
            return
        
        print("Creando usuarios...")
        admin = Usuario(
            email="admin@vccontrol.com",
            password_hash=get_password_hash("admin123"),
            nombre="Administrador",
            rol="admin"
        )
        operador = Usuario(
            email="operador@vccontrol.com",
            password_hash=get_password_hash("operador123"),
            nombre="Juan Operador",
            rol="operador"
        )
        db.add_all([admin, operador])
        db.flush()
        
        print("Creando clientes...")
        clientes_data = [
            {"nombre_empresa": "Industrias Quito S.A.", "contacto": "María García", "telefono": "099-123-4567"},
            {"nombre_empresa": "Comercial Andina", "contacto": "Carlos López", "telefono": "099-234-5678"},
            {"nombre_empresa": "TechnoSoluciones", "contacto": "Ana Martínez", "telefono": "099-345-6789"},
            {"nombre_empresa": "Distribuidora Central", "contacto": "Pedro Sánchez", "telefono": "099-456-7890"},
            {"nombre_empresa": "Agrícola del Valle", "contacto": "Laura Rodríguez", "telefono": "099-567-8901"},
        ]
        
        clientes = [Cliente(**data) for data in clientes_data]
        db.add_all(clientes)
        db.flush()
        
        print("Creando visitas y compromisos...")
        for i, cliente in enumerate(clientes[:3]):
            visita = Visita(
                id_cliente=cliente.id,
                id_visitante=operador.id,
                fecha_visita=datetime.now() - timedelta(days=i*2),
                observaciones=f"Visita de seguimiento a {cliente.nombre_empresa}. Se discutieron temas de mejora continua."
            )
            db.add(visita)
            db.flush()
            
            compromisos_data = [
                {
                    "titulo": f"Enviar cotización actualizada",
                    "descripcion": "Preparar y enviar cotización con nuevos precios",
                    "fecha_entrega": (datetime.now() + timedelta(days=7)).date(),
                    "estado": "pendiente"
                },
                {
                    "titulo": f"Coordinar reunión de seguimiento",
                    "descripcion": "Agendar próxima reunión para revisar avances",
                    "fecha_entrega": (datetime.now() + timedelta(days=14)).date(),
                    "estado": "en_progreso"
                },
            ]
            
            for comp_data in compromisos_data:
                compromiso = Compromiso(id_visita=visita.id, **comp_data)
                db.add(compromiso)
        
        db.commit()
        print("¡Datos de prueba creados exitosamente!")
        print("\nCredenciales de acceso:")
        print("  Admin: admin@vccontrol.com / admin123")
        print("  Operador: operador@vccontrol.com / operador123")
        
    except Exception as e:
        db.rollback()
        print(f"Error creando datos: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
