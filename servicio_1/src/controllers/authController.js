const bcrypt = require('bcrypt');
const supabase = require('../config/supabaseClient');

// ==========================================
// SIMULACION API COBOL (Registro Civil)
// ==========================================
const padronCobol = [
  { ci: "8374921", nombre_completo: "Carlos Mamani Choque", fecha_nacimiento: "1985-10-12", genero: "Masculino" },
  { ci: "6293847", nombre_completo: "Ana Condori Vargas", fecha_nacimiento: "1992-03-25", genero: "Femenino" },
  { ci: "4512789", nombre_completo: "Luis Fernando Rojas", fecha_nacimiento: "1978-07-04", genero: "Masculino" },
  { ci: "9834561", nombre_completo: "María Elena Quispe", fecha_nacimiento: "2001-11-30", genero: "Femenino" },
  { ci: "5566778", nombre_completo: "Roberto Aguilar Pinto", fecha_nacimiento: "1965-02-18", genero: "Masculino" },
  { ci: "1122334", nombre_completo: "Gabriela Suárez", fecha_nacimiento: "1995-09-09", genero: "Femenino" }
];

const validarDniEnCobol = async (ciBuscado) => {
  //simulacion de tiempo de respuesta del sistema COBOL
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const ciudadano = padronCobol.find(persona => persona.ci === ciBuscado);

  return ciudadano || null;
};



const registrarPaciente = async (req, res) => {
  try {
    const { ci, correo, contrasena, telefono, direccion, tipo_sangre, usuario_rol } = req.body;

    if (!ci || !correo || !contrasena || !usuario_rol) {
      return res.status(400).json({ success: false, message: 'Faltan datos obligatorios (CI, correo, contraseña, rol)' });
    }

    const datosCiviles = await validarDniEnCobol(ci);
    
    if (!datosCiviles) {
      return res.status(404).json({ success: false, message: 'El DNI no existe en el Registro Civil Nacional.' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .insert([{ 
        nombre: datosCiviles.nombre_completo,
        correo, 
        contrasena: hashedPassword, 
        fecha_nac: datosCiviles.fecha_nacimiento,
        usuario_rol:1
      }])
      .select('id, correo');

    if (usuarioError) {
      return res.status(500).json({ success: false, message: 'Error al registrar credenciales', error: usuarioError.message });
    }

    const nuevoUsuarioId = usuarioData[0].id;

    const { data: pacienteData, error: pacienteError } = await supabase
      .from('pacientes')
      .insert([{
        ci: datosCiviles.ci,
        genero: datosCiviles.genero,
        telefono,
        direccion,
        tipo_sangre,
        id_usuario: nuevoUsuarioId
      }]);

    if (pacienteError) {
      await supabase.from('usuarios').delete().eq('id', nuevoUsuarioId);
      return res.status(500).json({ success: false, message: 'Error al registrar perfil de paciente', error: pacienteError.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Paciente registrado exitosamente e integrado con Registro Civil',
      usuario: usuarioData[0]
    });
    
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ success: false, message: 'Correo y contraseña son requeridos' });
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', correo)
      .single();

    if (error || !usuario) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }


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
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      return res.status(500).json({ status: 'Error', message: 'Falla al conectar con Supabase' });
    }
    
    return res.status(200).json({ status: 'OK', service: 'Usuarios (Auth)' });
  } catch (error) {
    return res.status(500).json({ status: 'Error', message: 'Servicio no disponible' });
  }
};

const agregarRol = async (req, res) => {
  try {
    const { nombre_rol } = req.body;
    if (!nombre_rol) {
      return res.status(400).json({ success: false, message: 'Nombre del rol requerido' });
    }
    const { data, error } = await supabase
      .from('roles')
      .insert([{ nombre_rol }])
      .select('id_rol, nombre_rol');
      
    if (error) {
      return res.status(500).json({ success: false, message: 'Error al registrar rol', error: error.message });
    }
    return res.status(201).json({
      success: true,
      message: 'Rol registrado exitosamente',
      usuario: data[0]
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const registrarMedico = async (req, res) => {
  try {
    
    const { correo, contrasena, nombre, fecha_nac, usuario_rol, numero_licencia, especialidad, firma, institucion } = req.body;
    
    if (!correo || !contrasena || !nombre || !fecha_nac || !usuario_rol || !numero_licencia || !especialidad || !firma || !institucion) {
      return res.status(400).json({ success: false, message: 'Campos requeridos faltantes' });
    }


    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const hashedFirma = await bcrypt.hash(firma, 10); // <--- NUEVO

  
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .insert([{ nombre, correo, contrasena: hashedPassword, fecha_nac, usuario_rol }])
      .select('id, correo');

    if (usuarioError) {
      return res.status(500).json({ success: false, message: 'Error al registrar credenciales', error: usuarioError.message });
    }

    const nuevoUsuarioId = usuarioData[0].id;


    const { data: medicoData, error: medicoError } = await supabase
      .from('medicos')
      .insert([{
        numero_licencia,
        especialidad,
        firma: hashedFirma,
        institucion,
        id_usuario: nuevoUsuarioId
      }]);

    if (medicoError) {
      await supabase.from('usuarios').delete().eq('id', nuevoUsuarioId);
      return res.status(500).json({ success: false, message: 'Error al registrar el perfil profesional', error: medicoError.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Médico registrado exitosamente',
      usuario: usuarioData[0]
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

const registrarFarmacia = async (req, res) => {
  try {
    const { nombre } = req.body;

    if (!nombre) {
      return res.status(400).json({ success: false, message: 'El nombre de la farmacia es requerido' });
    }

    const { data, error } = await supabase
      .from('farmacias')
      .insert([{ nombre }])
      .select('*');

    if (error) {
      return res.status(500).json({ success: false, message: 'Error al registrar la farmacia', error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Farmacia registrada exitosamente',
      farmacia: data[0]
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};


const registrarPersonalFarmacia = async (req, res) => {
  try {
    const { correo, contrasena, nombre, fecha_nac, id_farmacia } = req.body;
    
    const usuario_rol = 3; 

    if (!correo || !contrasena || !nombre || !fecha_nac || !id_farmacia) {
      return res.status(400).json({ success: false, message: 'Campos requeridos faltantes (incluyendo id_farmacia)' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .insert([{ nombre, correo, contrasena: hashedPassword, fecha_nac, usuario_rol }])
      .select('id, correo');

    if (usuarioError) {
      return res.status(500).json({ success: false, message: 'Error al registrar credenciales del personal', error: usuarioError.message });
    }

    const nuevoUsuarioId = usuarioData[0].id;

    const { data: personalData, error: personalError } = await supabase
      .from('farmacias_usuarios')
      .insert([{
        id_usuario: nuevoUsuarioId,
        id_farmacia: id_farmacia
      }]);

    if (personalError) {
      await supabase.from('usuarios').delete().eq('id', nuevoUsuarioId);
      return res.status(500).json({ success: false, message: 'Error al vincular el usuario con la farmacia', error: personalError.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Personal de farmacia registrado y vinculado exitosamente',
      usuario: usuarioData[0]
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};


const registrarPersonalSalud = async (req, res) => {
  try {
    const { correo, contrasena, nombre, fecha_nac, usuario_rol, institucion, rol_especifico } = req.body;

    if (!correo || !contrasena || !nombre || !fecha_nac || !usuario_rol || !institucion || !rol_especifico) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    if (usuario_rol !== 4 && usuario_rol !== 6) {
      return res.status(400).json({ success: false, message: 'Rol inválido. Debe ser 4 (Paramédico) o 6 (Enfermería)' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .insert([{ nombre, correo, contrasena: hashedPassword, fecha_nac, usuario_rol }])
      .select('id, correo');

    if (usuarioError) {
      return res.status(500).json({ success: false, message: 'Error al registrar credenciales del personal', error: usuarioError.message });
    }

    const nuevoUsuarioId = usuarioData[0].id;

    const { data: personalData, error: personalError } = await supabase
      .from('personal_salud')
      .insert([{
        id_usuario: nuevoUsuarioId,
        institucion,
        rol_especifico 
      }]);

    if (personalError) {
      await supabase.from('usuarios').delete().eq('id', nuevoUsuarioId);
      return res.status(500).json({ success: false, message: 'Error al registrar el perfil de salud', error: personalError.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Personal de salud registrado exitosamente',
      usuario: usuarioData[0]
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};

const registrarAuditor = async (req, res) => {
  try {
    const { correo, contrasena, nombre, fecha_nac, usuario_rol } = req.body;

    if (!correo || !contrasena || !nombre || !fecha_nac || !usuario_rol) {
      return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .insert([{ nombre, correo, contrasena: hashedPassword, fecha_nac, usuario_rol }])
      .select('id, correo');

    if (usuarioError) {
      return res.status(500).json({ success: false, message: 'Error al registrar credenciales del auditor', error: usuarioError.message });
    }

    const nuevoUsuarioId = usuarioData[0].id;

    const { data: auditorData, error: auditorError } = await supabase
      .from('auditor')
      .insert([{ id_usuario: nuevoUsuarioId }]);

    if (auditorError) {
      await supabase.from('usuarios').delete().eq('id', nuevoUsuarioId);
      return res.status(500).json({ success: false, message: 'Error al registrar el perfil de auditoría', error: auditorError.message });
    }

    return res.status(201).json({
      success: true,
      message: 'Auditor registrado exitosamente',
      usuario: usuarioData[0]
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};




const obtenerMedicos = async (req, res) => {
  try {
    // Hace un JOIN implícito con la tabla usuarios para traer el nombre
    const { data, error } = await supabase
      .from('medicos')
      .select(`
        numero_licencia,
        especialidad,
        institucion,
        usuarios (nombre, correo)
      `);
      
    if (error) throw error;
    return res.status(200).json({ success: true, medicos: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al obtener médicos' });
  }
};


const obtenerFarmacias = async (req, res) => {
  try {
    const { data, error } = await supabase.from('farmacias').select('*');
    if (error) throw error;
    return res.status(200).json({ success: true, farmacias: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al obtener farmacias' });
  }
};

const obtenerPacientePorCI = async (req, res) => {
  try {
    const { ci } = req.params; 

    if (!ci) {
      return res.status(400).json({ success: false, message: 'El CI es requerido' });
    }

  
    const { data, error } = await supabase
      .from('pacientes')
      .select(`
        ci,
        genero,
        tipo_sangre,
        telefono,
        usuarios (nombre, correo, fecha_nac)
      `)
      .eq('ci', ci)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, message: 'Paciente no encontrado en el sistema' });
    }

    return res.status(200).json({ success: true, paciente: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor', error: error.message });
  }
};


module.exports = {
  registrarPaciente,
  login,
  health,
  agregarRol,
  registrarMedico,
  registrarFarmacia,
  registrarPersonalFarmacia,
  registrarPersonalSalud,
  registrarAuditor,
  obtenerMedicos,
  obtenerFarmacias,
  obtenerPacientePorCI
};


