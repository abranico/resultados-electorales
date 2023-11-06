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

mensajeAdvertencia.style.display = "block"
mensajeAdvertencia.innerHTML += " Debe seleccionar los valores a filtrar y hacer clic en el botón FILTRAR"


cargarAnios()


periodosSelect.addEventListener('change', () => {
    cargoSelect.innerHTML = "<option value='-' selected disabled>Cargo</option>"
    distritoSelect.innerHTML = "<option value='-' selected disabled>Distrito</option>"
    seccionesSelect.innerHTML = "<option value='-' selected disabled>Secciones</option>"
    cargarCargos()
})

cargoSelect.addEventListener('change', () => {
    distritoSelect.innerHTML = "<option value='-' selected disabled>Distrito</option>"
    seccionesSelect.innerHTML = "<option value='-' selected disabled>Secciones</option>"
    cargarDistritos()
})

distritoSelect.addEventListener('change', () => {
    seccionesSelect.innerHTML = "<option value='-' selected disabled>Secciones</option>"
    cargarSecciones()
})

botonFiltrar.addEventListener('click', (e) => {
    e.preventDefault()
    filtrar()
})

botonInformes.addEventListener('click', () => {
    mensajeExito.style.display = "none"
    mensajeError.style.display = "none"
    mensajeAdvertencia.style.display = "none"

    if(localStorage.getItem("INFORMES")){
        informes = JSON.parse(localStorage.getItem("INFORMES"))
    }
    nuevoInforme()
})

// COMBO AÑOS
async function cargarAnios() {
    loader.style.display = 'flex'
    try {
        const response = await fetch("https://resultados.mininterior.gob.ar/api/menu/periodos")

        if (response.ok) {
            const data = await response.json()
            data.forEach(item => {
                let option = document.createElement('option')
                option.text = item
                option.value = item
                periodosSelect.appendChild(option)
            })
            loader.style.display = 'none'

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


// COMBO CARGOS
async function cargarCargos() {
    loader.style.display = 'flex'
    try {
        const response = await fetch("https://resultados.mininterior.gob.ar/api/menu?año=" + periodosSelect.value)

        if (response.ok) {
            const data = await response.json()
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

//COMBO DISTRITOS
function cargarDistritos() {
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

//COMBO SECCIONES
function cargarSecciones() {
    cargos.forEach((eleccion) => {
        if (eleccion.IdEleccion == tipoEleccion) {
            eleccion.Cargos.forEach((cargo) => {
                if (cargo.IdCargo == cargoSelect.value) {
                    cargo.Distritos.forEach((distrito) => {
                        distrito.SeccionesProvinciales.forEach((seccionesProvinciales) => {
                            hdSeccionProvincial.value = `${seccionesProvinciales.IDSeccionProvincial}`
                            seccionesProvinciales.Secciones.forEach((seccion) => {
                                let option = document.createElement('option')
                                option.text = seccion.Seccion
                                option.value = seccion.IdSeccion
                                seccionesSelect.appendChild(option)
                            })
                        })
                    })
                }
            });
        }
    })
}


//FILTRAR
async function filtrar() {
    loader.style.display = 'flex'
    if(validarFiltro()){
       const URL = `https://resultados.mininterior.gob.ar/api/resultados/getResultados?anioEleccion=${periodosSelect.value}&tipoRecuento=${tipoRecuento}&tipoEleccion=${tipoEleccion}&categoriaId=${cargoSelect.value}&distritoId=${distritoSelect.value}&seccionProvincialId=${hdSeccionProvincial.value == "null" ? "" : hdSeccionProvincial.value }&seccionId=${seccionesSelect.value}&circuitoId=&mesaId=`
       try {
           const response = await fetch(URL)

           if (response.ok) {
               const data = await response.json()
               
               cargarTitulos()
               cargarMapa()
               
               mesasEscrutadas = data.estadoRecuento.mesasTotalizadas
               electores = data.estadoRecuento.cantidadElectores
               participacionEscrutado = data.estadoRecuento.participacionPorcentaje
               valoresTotalizadosPositivos = data.valoresTotalizadosPositivos
               mostrarElectores.innerHTML = `${electores}`
               mostrarMesasComputadas.innerHTML = `${mesasEscrutadas}`
               mostrarParticipacionEscrutado.innerHTML = `${participacionEscrutado}%`
               cargarAgrupaciones()
               cargarGraficaResumen()

               nuevoInf =  {
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

function validarFiltro() {
    mensajeAdvertencia.style.display = 'none'
    mensajeError.style.display = 'none'
    mensajeExito.style.display = 'none'
    mensajeAdvertencia.innerHTML = `<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>`
    mensajeError.innerHTML = `<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>`

    if (periodosSelect.value == "-" || cargoSelect.value == "-" || distritoSelect.value == "-" || seccionesSelect.value == "-") {
        
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
        return false
    }
    return true   
}

function cargarTitulos() {
    titulo.innerText = `Elecciones ${periodosSelect.value} | ${tipoEleccion == 1 ? 'Paso' : 'Generales'}`
    subtitulo.innerText = `${periodosSelect.value} > ${tipoEleccion == 1 ? 'Paso' : 'Generales'} > ${cargoSelect.options[cargoSelect.selectedIndex].text} > ${distritoSelect.options[distritoSelect.selectedIndex].text} > ${seccionesSelect.options[seccionesSelect.selectedIndex].text}`
}   

function cargarMapa() {
    nombreMapa.innerText = distritoSelect.options[distritoSelect.selectedIndex].text
    svgMapa.innerHTML = mapas[parseInt(distritoSelect.value)]
}


function nuevoInforme() {
    if (validarFiltro()) {
        if (nuevoInf) {
            let informeExistente = false;

            const nuevoInformeJSON = JSON.stringify(nuevoInf);

            for (let i = 0; i < informes.length; i++) {
                const informeExistenteJSON = JSON.stringify(informes[i]);

                if (nuevoInformeJSON === informeExistenteJSON) {
                    informeExistente = true;
                    break;
                }
            }

            if (informeExistente) {
                mensajeAdvertencia.style.display = "block";
                mensajeAdvertencia.innerHTML += "El informe ya está creado";
            } else {
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

function cargarAgrupaciones(){
    contenedorAgrupacion.innerHTML = ""
    console.log(valoresTotalizadosPositivos)
    valoresTotalizadosPositivos.forEach((agrupacion)=>{
        let nuevaAgrupacion = document.createElement('div')
        nuevaAgrupacion.classList.add('agrupacion')
        nuevaAgrupacion.innerHTML =`<h4 class="titulo_agrupacion">${agrupacion.nombreAgrupacion}</h4>`
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
                    <div class="progress" style="background: ${agrupacionesColores[agrupacion.idAgrupacion]?.colorLiviano || "grey"};">
                        <div class="progress-bar"
                            style="width:${votosPorcentaje}%; background: ${agrupacionesColores[agrupacion.idAgrupacion]?.colorPleno || "black"};">
                            <span class="progress-bar-text">${votosPorcentaje}%</span>
                        </div>
                    </div>
                </div>
                `  
            })
        contenedorAgrupacion.appendChild(nuevaAgrupacion)
    })
}

function cargarGraficaResumen(){
    contenedorGrafico.innerHTML = ""
    let grafico = document.createElement('div')
    grafico.classList.add('grid')
    
    let resumen = valoresTotalizadosPositivos.map((agrupacion) => [agrupacion.nombreAgrupacion, agrupacion.votosPorcentaje])
    resumen.sort((a, b) => b[1] - a[1])
    console.log(resumen)
    let restantes
    if(resumen.length > 7){
       restantes = resumen.slice(7) 
       resumen = resumen.slice(0, 7)
       
    }

    resumen.forEach((agrupacion)=>{
        grafico.innerHTML += `<div class="bar" style="--bar-value:${agrupacion[1]}%;--bar-color:${agrupacionesColores[agrupacion.idAgrupacion]?.colorPleno || "red"};" data-name="${agrupacion[0]}" title="${agrupacion[0]}"></div>`
    })
    if(restantes){
        let otros = 0
        restantes.forEach((agrupacion)=>{
            otros += agrupacion[1]
        })
        grafico.innerHTML += `<div class="bar" style="--bar-value:${otros}%;--bar-color: grey;" data-name="Otros" title="Otros"></div>`

        
    }

    contenedorGrafico.appendChild(grafico)
    

    

}