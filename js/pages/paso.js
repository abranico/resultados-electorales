
// ---------- VARIABLES ----------

const tipoEleccion = 1
const periodosSelect = document.getElementById('años')
const cargoSelect = document.getElementById('cargos')
const distritoSelect = document.getElementById('distritos')
const seccionesSelect = document.getElementById('secciones')
const hdSeccionProvincial = document.getElementById('hdSeccionProvincial')
const botonFiltrar = document.getElementById('boton_filtrar')
const mensajeAdvertencia = document.getElementById('mensajeAdvertencia')
const mensajeError = document.getElementById('mensajeError')
const mensajeExito = document.getElementById('mensajeExito')
const titulo = document.getElementById('titulo')
const subtitulo = document.getElementById('subtitulo')
const nombreMapa = document.getElementById('nombre_mapa')
const svgMapa = document.getElementById('svg_mapa')
const botonInformes = document.getElementById('botonInformes')
const contenedorAgrupacion = document.getElementById('contenedorAgrupacion')
const agrupacion = document.getElementById('agrupacion')
const contenedorGrafico = document.getElementById('contenedorGrafico')
const mostrarMesasComputadas = document.getElementById('mesasComputadas')
const mostrarElectores = document.getElementById('electores')
const mostrarParticipacionEscrutado = document.getElementById('participacionEscrutado')
const loader = document.getElementById('loader')
let mesasEscrutadas
let electores
let participacionEscrutado
let valoresTotalizadosPositivos = []
let cargos
let informes = []
let nuevoInf

// ---------- EJECUCION ----------

// Se muestra el mensaje inicial
mensajeAdvertencia.style.display = "block"
mensajeAdvertencia.innerHTML += " Debe seleccionar los valores a filtrar y hacer clic en el botón FILTRAR"

// Se llama a la funcion para que cargue los años como primer combo y luego se puedan cargar los demas
cargarAnios()


// ---------- MANEJO DE EVENTOS ----------


periodosSelect.addEventListener('change', () => {
    // Se resetea el html de los combos siguientes al año
    cargoSelect.innerHTML = "<option value='-' selected disabled>Cargo</option>"
    distritoSelect.innerHTML = "<option value='-' selected disabled>Distrito</option>"
    seccionesSelect.innerHTML = "<option value='-' selected disabled>Secciones</option>"
    // Se carga el combo de cargos
    cargarCargos()
})


cargoSelect.addEventListener('change', () => {
    // Se resetea el html de los combos siguientes al cargo
    distritoSelect.innerHTML = "<option value='-' selected disabled>Distrito</option>"
    seccionesSelect.innerHTML = "<option value='-' selected disabled>Secciones</option>"
    // Se carga el combo de distritos
    cargarDistritos()
})


distritoSelect.addEventListener('change', () => {
    // Se resetea el html de los combos siguientes al distrito
    seccionesSelect.innerHTML = "<option value='-' selected disabled>Secciones</option>"
    // Se carga el combo de secciones
    cargarSecciones()
})


botonFiltrar.addEventListener('click', (e) => {
    // Se anula el comportamiento predeterminado que en este caso actualiza la pagina
    e.preventDefault()
    // Se llama a la funcion para filtrar
    filtrar()
})


botonInformes.addEventListener('click', () => {
    // Se ocultan los mensajes de alerta para que luego se actualicen
    mensajeExito.style.display = "none"
    mensajeError.style.display = "none"
    mensajeAdvertencia.style.display = "none"
    // Si la lista de informes existe se lo guarda en la variable informes
    // En el caso de que no exista queda como un array vacio
    if(localStorage.getItem("INFORMES")){
        informes = JSON.parse(localStorage.getItem("INFORMES"))
    }
    // Se crea un nuevo informe
    nuevoInforme()
})


// ---------- COMBOS ----------


// COMBO AÑOS
async function cargarAnios() {
    // Se muestra el loader
    loader.style.display = 'flex'
    try {
        // Se llama a la api y si esta disponible luego se espera al json con los datos
        const response = await fetch("https://resultados.mininterior.gob.ar/api/menu/periodos")
        if (response.ok) {
            const data = await response.json()
            // Se recorren los datos para crear un option y agregarlo al select
            data.forEach(item => {
                let option = document.createElement('option')
                option.text = item
                option.value = item
                periodosSelect.appendChild(option)
            })
            // Se oculta el loader
            loader.style.display = 'none'
        } else {
            // Si no esta disponible la api entonces se crea un error que manejamos en catch
            throw "Hubo un error al consultar."
        }
    // En caso de que haya un error se muestra en la consola y en la pantalla 
    } catch (error) {
        console.error(error)
        mensajeError.style.display = 'block'
        mensajeError.innerHTML += `ERROR: ${error}`
    }
    // Se oculta el loader
    loader.style.display = 'none'
}


// COMBO CARGOS
async function cargarCargos() {
    loader.style.display = 'flex'
    try {
        // Se llama a la api y si esta disponible luego se espera al json con los datos
        const response = await fetch("https://resultados.mininterior.gob.ar/api/menu?año=" + periodosSelect.value)
        if (response.ok) {
            const data = await response.json()
            // Se guardan los datos de los cargos en la variable global cargos para usarlo luego
            cargos = data
            data.forEach((eleccion) => {
                if (eleccion.IdEleccion == tipoEleccion) {
                    eleccion.Cargos.forEach((cargo) => {
                        let option = document.createElement('option')
                        option.text = cargo.Cargo
                        option.value = cargo.IdCargo
                        cargoSelect.appendChild(option)
                    })
                }
            })
        } else {
            throw "Hubo un error al consultar."
        }
    } catch (error) {
        console.error(error)
        mensajeError.style.display = 'block'
        mensajeError.innerHTML += `ERROR: ${error}` 
    }
    loader.style.display = 'none'
}


// COMBO DISTRITOS
function cargarDistritos() {
    // Se recorre cargos y se validan los datos para poder cargar los distritos
    cargos.forEach((eleccion) => {
        if (eleccion.IdEleccion == tipoEleccion) {
            eleccion.Cargos.forEach((cargo) => {
                if (cargo.IdCargo == cargoSelect.value) {
                    cargo.Distritos.forEach((distrito) => {
                        let option = document.createElement('option')
                        option.text = distrito.Distrito
                        option.value = distrito.IdDistrito
                        distritoSelect.appendChild(option)
                    })
                }
            });
        }
    })
}


// COMBO SECCIONES
function cargarSecciones() {
    // Se recorren los cargos para luego cargar las secciones
    cargos.forEach((eleccion) => {
        // Se valida el tipo de eleccion
        if (eleccion.IdEleccion == tipoEleccion) {
            eleccion.Cargos.forEach((cargo) => {
                // Se valida el tipo de cargo
                if (cargo.IdCargo == cargoSelect.value) {
                    cargo.Distritos.forEach((distrito) => {
                        // Se valida el tipo de distrito
                        if (distrito.IdDistrito == distritoSelect.value) {
                            distrito.SeccionesProvinciales.forEach((seccionProvincial) => {
                                hdSeccionProvincial.value = `${seccionProvincial.IDSeccionProvincial}`
                                // Se recorren los distritos y se carga el combo
                                seccionProvincial.Secciones.forEach((seccion) => {
                                    // Se valida que la seccion no sea null
                                    if(seccion.Seccion){
                                        let option = document.createElement('option')
                                        option.text = seccion.Seccion
                                        option.value = seccion.IdSeccion
                                        seccionesSelect.appendChild(option)
                                    }
                                                                                       
                                })
                            })
                        }
                    })
                }
            });
        }
    })
    
    // Si no hay secciones se oculta el combo de secciones
    if(seccionesSelect.childElementCount == 1){
        seccionesSelect.style.display = 'none'
    }else{
        seccionesSelect.style.display = 'inline'
    }
}


// ---------- FILTRADO ----------


// VALIDAR FILTRADO
function validarFiltro() {
    // Se resetean los mensajes de alerta tanto el contenido como su visualizacion ocultandolo
    mensajeAdvertencia.style.display = 'none'
    mensajeError.style.display = 'none'
    mensajeExito.style.display = 'none'
    mensajeAdvertencia.innerHTML = `<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>`
    mensajeError.innerHTML = `<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>`

    // Se valida que alguno de los combos se encuentre vacio
    if (periodosSelect.value == "-" || cargoSelect.value == "-" || distritoSelect.value == "-" || seccionesSelect.value == "-") {
        // Se muestran los combos vacios y se concatena el mensaje que luego se muestra como advertencia
        mensajeAdvertencia.style.display = "block"
        let mensaje = " Falta seleccionar: "
        if (periodosSelect.value == "-") {
            mensaje += "AÑO - "
        }
        if (cargoSelect.value == "-") {
            mensaje += "CARGO - "
        }
        if (distritoSelect.value == "-") {
            mensaje += "DISTRITO - "
        }
        if (seccionesSelect.value == "-") {
            mensaje += "SECCION "
        }
        mensajeAdvertencia.innerHTML += mensaje
        // Se devuelve falso ya que no se valido correctamente
        return false
    }
    // Devuelve verdadero ya que todos los combos se validaron correctamente
    return true   
}


// FILTRAR
async function filtrar() {
    loader.style.display = 'flex'
    // Se valida que haya ingresado los datos para filtar
    if(validarFiltro()){
       const URL = `https://resultados.mininterior.gob.ar/api/resultados/getResultados?anioEleccion=${periodosSelect.value}&tipoRecuento=${tipoRecuento}&tipoEleccion=${tipoEleccion}&categoriaId=${cargoSelect.value}&distritoId=${distritoSelect.value}&seccionProvincialId=${hdSeccionProvincial.value == "null" ? "" : hdSeccionProvincial.value }&seccionId=${seccionesSelect.value}&circuitoId=&mesaId=`
       try {
           const response = await fetch(URL)
           if (response.ok) {
               const data = await response.json()
               
               // Se guardan los datos en las variables globales
               mesasEscrutadas = data.estadoRecuento.mesasTotalizadas
               electores = data.estadoRecuento.cantidadElectores
               participacionEscrutado = data.estadoRecuento.participacionPorcentaje
               valoresTotalizadosPositivos = data.valoresTotalizadosPositivos

               // Se muestran los datos 
               mostrarElectores.innerHTML = `${electores}`
               mostrarMesasComputadas.innerHTML = `${mesasEscrutadas}`
               mostrarParticipacionEscrutado.innerHTML = `${participacionEscrutado}%`
               
               // Se crea un objeto con los datos del informe a crear 
               nuevoInf = {
                    anioEleccion: periodosSelect.value,
                    tipoRecuento: tipoRecuento,
                    tipoEleccion: tipoEleccion,  
                    categoriaId: cargoSelect.value,
                    categoria: cargoSelect.options[cargoSelect.selectedIndex].text,
                    distritoId: distritoSelect.value,
                    distrito: distritoSelect.options[distritoSelect.selectedIndex].text,
                    seccionProvincialId: hdSeccionProvincial.value == "null" ? "" : hdSeccionProvincial.value,
                    seccionId: seccionesSelect.value,
                    seccion: seccionesSelect.options[seccionesSelect.selectedIndex].text,
                    circuitoId: "",
                    mesaId: ""
               }

               // Se carga la informacion en pantalla con los datos recogidos
               cargarTitulos()
               cargarMapa()
               cargarAgrupaciones()
               cargarGraficoResumen()
               
           } else {
               throw "Hubo un error al consultar."
           }
       } catch (error) {
           console.error(error)
           mensajeError.style.display = 'block'
           mensajeError.innerHTML += `ERROR: ${error}`
       }
    }
    loader.style.display = 'none'

}


// MOSTRAR TITULOS
function cargarTitulos() {
    titulo.innerText = `Elecciones ${periodosSelect.value} | ${tipoEleccion == 1 ? 'Paso' : 'Generales'}`
    subtitulo.innerText = `${periodosSelect.value} > ${tipoEleccion == 1 ? 'Paso' : 'Generales'} > ${cargoSelect.options[cargoSelect.selectedIndex].text} > ${distritoSelect.options[distritoSelect.selectedIndex].text} > ${seccionesSelect.options[seccionesSelect.selectedIndex].text}`
}   


// MOSTRAR MAPA
function cargarMapa() {
    nombreMapa.innerText = distritoSelect.options[distritoSelect.selectedIndex].text
    svgMapa.innerHTML = mapas[parseInt(distritoSelect.value)]
}


// MOSTRAR AGRUPACIONES
function cargarAgrupaciones(){
    // Se borra el html del contenedor para actualizar el contenido
    contenedorAgrupacion.innerHTML = ""
    
    // Se ordena por la cantidad de votos y se guarda en otra variable
    let agrupaciones = valoresTotalizadosPositivos.sort((a, b) => b.votos - a.votos)
    
    // Se recorren los datos ordenados
    agrupaciones.forEach((agrupacion)=>{
        let nuevaAgrupacion = document.createElement('div')
        nuevaAgrupacion.classList.add('agrupacion')
        nuevaAgrupacion.innerHTML =`<h4 class="titulo_agrupacion">${agrupacion.nombreAgrupacion}</h4>`
        
        // Se recorre cada lista para mostrar los de cada una por pantalla
        agrupacion.listas.forEach((lista)=>{  
            let nombre = lista.nombre
            let votos = lista.votos
            let votosPorcentaje = lista.votos * 100 / agrupacion.votos
            votosPorcentaje = votosPorcentaje.toFixed(2)

            nuevaAgrupacion.innerHTML +=`
                <div class="partido_contenedor">
                    <div class="partido_descripcion_contenedor">
                        <h5 class="partido_titulo">${nombre}</h5>
                        <div>
                            <p id="votosPorcentaje">${votosPorcentaje}%</p>
                            <p id="votos">${votos}</p>
                        </div>
                    </div>
                    <div class="progress" style="background: ${agrupacionesColores[agrupacion.nombreAgrupacion]?.colorLiviano || "grey"};">
                        <div class="progress-bar"
                            style="width:${votosPorcentaje}%; background: ${agrupacionesColores[agrupacion.nombreAgrupacion]?.colorPleno || "black"};">
                            <span class="progress-bar-text">${votosPorcentaje}%</span>
                        </div>
                    </div>
                </div>
                `  
            })
        
        contenedorAgrupacion.appendChild(nuevaAgrupacion)
    })
}


// MOSTRAR GRAFICO
function cargarGraficoResumen(){
    // Se borra el html del contenedor para actualizar el contenido
    contenedorGrafico.innerHTML = ""

    let grafico = document.createElement('div')
    grafico.classList.add('grid')
    
    // Se crea un nuevo array que solo guarda el nombre y el porcentaje de votos
    let resumen = valoresTotalizadosPositivos.map((agrupacion) => [agrupacion.nombreAgrupacion, agrupacion.votosPorcentaje])
    // Se ordena el nuevo array por la cantidad de votos
    resumen.sort((a, b) => b[1] - a[1])
    
    // Si hay mas de 7 agrupaciones se guardan las restantes en otra variable
    let restantes
    if(resumen.length > 7){
       restantes = resumen.slice(7) 
       resumen = resumen.slice(0, 7)
    }

    // Se recorre cada agrupacion para mostrarlo
    resumen.forEach((agrupacion)=>{
        grafico.innerHTML += `<div class="bar" style="--bar-value:${agrupacion[1]}%;--bar-color:${agrupacionesColores[agrupacion[0]]?.colorPleno || "grey"};" data-name="${agrupacion[0]}" title="${agrupacion[0]}"></div>`
    })

    // Si finalmente hubo agrupaciones restantes se muestran en una sola barra como "otros"
    if(restantes){
        let otros = 0
        restantes.forEach((agrupacion)=>{
            otros += agrupacion[1]
        })
        grafico.innerHTML += `<div class="bar" style="--bar-value:${otros}%;--bar-color: grey;" data-name="Otros" title="Otros"></div>`
    }

    // Finalmente se agrega todo el contenido al contenedor
    contenedorGrafico.appendChild(grafico)
}


// ---------- CREAR INFORME ----------


function nuevoInforme() {
    // Se valida que haya ingresado los datos para crear el nuevo informe
    if (validarFiltro()) {
        // Se valida que el objeto del nuevo informe no este vacio
        if (nuevoInf) {
            // Se valida que el informe no este ya creado
            if(JSON.stringify(informes).includes(JSON.stringify(nuevoInf))){
                mensajeAdvertencia.style.display = "block";
                mensajeAdvertencia.innerHTML += "El informe ya está creado";
            } else {
                // Si no esta creado se crea agregando el objeto al array informes
                // Se agrega el array informes actualizado al localstorage y se muestra un mensaje
                informes.push(nuevoInf);
                localStorage.setItem("INFORMES", JSON.stringify(informes));
                mensajeExito.style.display = "block";
            }
        } else {
            mensajeAdvertencia.style.display = "block";
            mensajeAdvertencia.innerHTML += "Debe seleccionar los valores a filtrar y hacer clic en el botón FILTRAR";
        }
    }
}