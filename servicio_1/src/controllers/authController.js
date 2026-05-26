const bcrypt = require('bcrypt');
const supabase = require('../config/supabaseClient');

const register = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Guardar en Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ correo, contrasena: hashedPassword }])
      .select('id, correo');

    if (error) {
      return res.status(500).json({ success: false, message: 'Error al registrar usuario', error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      usuario: data[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos' });
    }

    // Buscar usuario por correo
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', correo)
      .single();

    if (error || !usuario) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    // Retornar éxito sin la contraseña
    const { contrasena: _, ...userData } = usuario;

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      usuario: userData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const health = async (req, res) => {
  try {
    // Verificar conexión (query muy básico, ej: recuperar la sesión o verificar auth client)
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return res.status(500).json({ status: 'Error', message: 'Falla al conectar con Supabase' });
    }
    
    return res.status(200).json({ status: 'OK', service: 'Usuarios (Auth)' });
  } catch (error) {
    return res.status(500).json({ status: 'Error', message: 'Servicio no disponible' });
  }
};

module.exports = {
  register,
  login,
  health
};
