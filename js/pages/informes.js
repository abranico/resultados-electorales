const mensajeExito = document.getElementById('mensajeExito')
const mensajeError = document.getElementById('mensajeError')
const mensajeAdvertencia = document.getElementById('mensajeAdvertencia')

const contenedorInformes = document.getElementById('contenedorInformes')

const loader = document.getElementById('loader')

let informes = JSON.parse(localStorage.getItem('INFORMES'))


if(informes){
    cargarInformes()
}else{
    mensajeAdvertencia.style.display = "block"
}


function cargarInformes(){
    loader.style.display = 'flex'
    contenedorInformes.innerHTML = ""
    informes.forEach(async(informe)=>{
        
        let { anioEleccion, categoriaId, categoria, circuitoId, distritoId, distrito, mesaId, seccionId, seccion, seccionProvincialId, tipoEleccion, tipoRecuento} = informe
        let URL = `https://resultados.mininterior.gob.ar/api/resultados/getResultados?anioEleccion=${anioEleccion}&tipoRecuento=${tipoRecuento}&tipoEleccion=${tipoEleccion}&categoriaId=${categoriaId}&distritoId=${distritoId}&seccionProvincialId=${seccionProvincialId}&seccionId=${seccionId}&circuitoId=${circuitoId}&mesaId=${mesaId}`
        try{
            
            let response = await fetch(URL)
            if (response.ok) {
                let data = await response.json()
                
                
                let svgMapa = mapas[distritoId]
                let titulo = `Elecciones ${anioEleccion} | ${tipoEleccion == 1 ? 'Paso' : 'Generales'}`
                let subtitulo = `${anioEleccion} > <br> ${tipoEleccion == 1 ? 'Paso' : 'Generales'} > <br> ${categoria} > <br> ${distrito} > <br> ${seccion}`
                let mesasComputadas = `${data.estadoRecuento.mesasTotalizadas}`
                let electores = `${data.estadoRecuento.cantidadElectores}`
                let participacionEscrutado = `${data.estadoRecuento.participacionPorcentaje}%`
                let nuevoInforme = cargarHTMLInforme(svgMapa, titulo, subtitulo, mesasComputadas, electores, participacionEscrutado)
                cargarDatosAgrupacion(data.valoresTotalizadosPositivos, nuevoInforme)

                contenedorInformes.appendChild(nuevoInforme)
            }else{
                throw "Hubo un error al consultar."
            }
            loader.style.display = 'none'
        }catch(error){
            console.error(error)
            mensajeError.style.display = "block"
            mensajeError.innerHTML += error
        }
    })
    
    
}


function cargarDatosAgrupacion(agrupaciones, nuevoInforme){
    agrupaciones = agrupaciones.sort((a, b) => b.votos - a.votos)

    agrupaciones.forEach(agrupacion =>{
        let contenedorDatosAgrupacion = nuevoInforme.querySelector('.contenedor-datos-agrupacion')

        let nuevaAgrupacion = document.createElement('div')
        nuevaAgrupacion.classList.add('datos_agrupacion')
        nuevaAgrupacion.innerHTML =`
        <p class="agrupacion_nombre">${agrupacion.nombreAgrupacion}</p>
            <div>
                <p>${agrupacion.votosPorcentaje}%</p>
                <p class="agrupacion_votos">${agrupacion.votos} Votos</p>
            </div>`

        contenedorDatosAgrupacion.appendChild(nuevaAgrupacion)
    })
}


function cargarHTMLInforme(svgMapa, titulo, subtitulo, mesasComputadas, electores, participacionEscrutado){
    let nuevoInforme = document.createElement('tr')
    
    nuevoInforme.innerHTML = `
    <td class="contenedor_mapa">
        <svg class="mapa">
            ${svgMapa}
        </svg>

    </td>
    <td class="columna_elecciones">
        <p class="texto-elecciones-chico">${titulo}</p>
        <p class="texto-path-chico">${subtitulo}</p>
    </td>
    <td class="datos_generales">
        <div class="recuadros-informativos">
            <div class="recuadro recuadro_1">
                <div class="icono">
                    <img src="img/icons/urna.svg" alt="">
                </div>
                <div class="informacion">
                    <p class="informacion_titulo">Mesas computadas</p>
                    <p>${mesasComputadas}</p>
                </div>
            </div>
            <div class="recuadro recuadro_2">
                <div class="icono">
                    <img src="img/icons/electores.svg" alt="">
                </div>
                <div class="informacion">
                    <p class="informacion_titulo">Electores</p>
                    <p>${electores}</p>
                </div>
            </div>
            <div class="recuadro recuadro_3">
                <div class="icono">
                    <img src="img/icons/participacion.svg" alt="">
                </div>
                <div class="informacion">
                    <p class="informacion_titulo">Participación sobre escrutado</p>
                    <p>${participacionEscrutado}</p>
                </div>
            </div>
        </div>
    </td>
    <td class="contenedor_agrupacion">
        <div class="contenedor-datos-agrupacion">

        </div>
    </td>`
    
    return nuevoInforme
}