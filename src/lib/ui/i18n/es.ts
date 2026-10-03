import type { Messages } from './en';

export const es: Messages = {
	meta: {
		homeTitle: 'QuantPulse — Análisis de valores de nivel institucional',
		tickerTitle: (ticker, name) =>
			name ? `${ticker} · ${name} · QuantPulse` : `${ticker} · QuantPulse`
	},
	layout: {
		skipToContent: 'Saltar al contenido',
		home: 'Inicio de QuantPulse',
		footerLocal: 'QuantPulse · Análisis calculado localmente en tu navegador.',
		footerData:
			'Datos de mercado de Yahoo Finance. Solo con fines informativos; no constituye asesoramiento de inversión.',
		language: 'Idioma',
		darkTheme: 'Tema oscuro',
		lookbackRange: 'Periodo de análisis'
	},
	search: {
		label: 'Símbolo del valor',
		placeholder: 'Símbolo — AAPL, SPY, VWCE.DE',
		invalid: 'Introduce un símbolo válido.'
	},
	watchlist: {
		title: 'Favoritos',
		recent: 'Recientes',
		emptyWatchlist: 'Marca un valor con la estrella para fijarlo aquí.',
		emptyRecent: 'Los valores analizados aparecerán aquí.',
		remove: (ticker) => `Quitar ${ticker} de favoritos`,
		toggle: (ticker) => `Favorito ${ticker}`,
		open: 'Abrir favoritos',
		close: 'Cerrar favoritos',
		sheetTitle: 'Valores'
	},
	home: {
		eyebrow: 'Análisis de valores',
		title: 'Análisis de rentabilidad y riesgo de nivel institucional para cualquier acción o ETF.',
		intro:
			'Introduce un símbolo arriba para analizar su rentabilidad, su perfil de riesgo y la distribución de sus rendimientos, o empieza con uno de los valores siguientes.',
		featured: 'Valores destacados',
		why: 'Por qué QuantPulse',
		pillars: [
			{
				title: 'Métricas institucionales',
				body: 'CAGR, volatilidad, Sharpe, Sortino, Calmar, drawdowns, VaR, expected shortfall y momentos de orden superior.'
			},
			{
				title: 'Calculado en tu dispositivo',
				body: 'Los precios se obtienen directamente y cada estadística se calcula localmente, sin servidores intermedios.'
			},
			{
				title: 'Privado por diseño',
				body: 'Sin cuentas ni rastreo. Tus favoritos solo se guardan en este navegador.'
			}
		]
	},
	quote: {
		asOf: 'Actualizado',
		volume: 'Volumen',
		fiftyTwoWeekRange: 'Rango de 52 semanas',
		rangePosition: (percent) => `El precio está al ${percent} % de su rango de 52 semanas`
	},
	dashboard: {
		loading: 'Cargando análisis',
		loadingSection: (label) => `Cargando ${label}`,
		charts: 'gráficos',
		statistics: 'estadísticas',
		analysisPeriod: 'Periodo analizado',
		sessions: 'sesiones',
		adjustedCloses: 'cierres ajustados'
	},
	progress: {
		label: 'Progreso del análisis',
		failed: 'Error',
		stages: {
			resolving: 'Validando símbolo',
			quote: 'Obteniendo cotización',
			history: 'Obteniendo histórico',
			computing: 'Calculando estadísticas',
			rendering: 'Renderizando'
		}
	},
	metrics: {
		heading: 'Métricas clave',
		howCalculated: (label) => `Cómo se calcula ${label}`,
		cagr: {
			label: 'CAGR',
			caption: 'Tasa de crecimiento anual compuesta en el periodo seleccionado.',
			formula:
				'(Precio final ÷ precio inicial)^(365,25 ÷ días naturales) − 1, con cierres ajustados por splits y dividendos.'
		},
		volatility: {
			label: 'Volatilidad',
			caption: 'Desviación típica anualizada de los rendimientos diarios.',
			formula: 'Desviación típica muestral de los rendimientos diarios simples × √252.'
		},
		sharpe: {
			label: 'Sharpe',
			caption: (rf) => `Exceso de rentabilidad por unidad de riesgo total (rf ${rf}).`,
			formula: '(Rendimiento diario medio − rf ÷ 252) × 252 ÷ volatilidad anualizada.'
		},
		sortino: {
			label: 'Sortino',
			caption: (rf) => `Exceso de rentabilidad por unidad de riesgo bajista (rf ${rf}).`,
			formula:
				'(Rendimiento diario medio − rf ÷ 252) × 252 ÷ desviación bajista anualizada respecto a rf.'
		},
		maxDrawdown: {
			label: 'Drawdown máximo',
			caption: (peak, trough, recovered) =>
				`${peak} → ${trough}, ${recovered ? 'recuperado' : 'no recuperado'}.`,
			none: 'Sin caídas desde un máximo previo en este periodo.',
			formula: 'Mayor caída de máximo a mínimo del cierre ajustado: min(Pₜ ÷ max(P₀…Pₜ) − 1).'
		},
		currentDrawdown: {
			label: 'Drawdown actual',
			caption: 'Distancia del último cierre respecto a su máximo acumulado.',
			formula: 'Último cierre ajustado ÷ cierre ajustado máximo del periodo − 1.'
		},
		valueAtRisk: {
			label: 'VaR 95 %',
			caption: 'Umbral de pérdida diaria superado en el 5 % de las sesiones.',
			formula: 'Percentil 5 de los rendimientos diarios históricos (interpolación lineal).'
		},
		positiveDays: {
			label: 'Días positivos',
			caption: 'Proporción de sesiones que cerraron por encima de la sesión anterior.',
			formula: 'Número de rendimientos diarios > 0 ÷ total de rendimientos diarios.'
		}
	},
	charts: {
		period: 'Periodo',
		value: 'Valor',
		daily: {
			title: 'Rendimientos diarios',
			subtitle: (count) => `Últimas ${count} sesiones`,
			description: (count) =>
				`Gráfico de barras de los rendimientos diarios simples de las últimas ${count} sesiones. Las barras sobre la línea cero son ganancias y las inferiores, pérdidas.`
		},
		monthly: {
			title: 'Rendimientos mensuales',
			subtitle: (count) => `Últimos ${count} meses, compuestos`,
			description: (count) =>
				`Gráfico de barras de los rendimientos compuestos por mes natural de los últimos ${count} meses.`
		},
		weekday: {
			title: 'Estacionalidad semanal',
			chartTitle: 'Rendimiento medio por día de la semana',
			subtitle: 'Rendimiento diario medio',
			description:
				'Gráfico de barras del rendimiento diario medio agrupado por día de la semana en el periodo seleccionado.',
			sessions: (count) => `${count} sesiones`
		}
	},
	statistics: {
		heading: 'Estadísticas',
		calendarHeading: 'Calendario de rendimientos mensuales',
		calendarCaption: 'Rendimientos mensuales por año natural con totales anuales compuestos',
		year: 'Año',
		groups: { returns: 'Rentabilidad', risk: 'Riesgo', distribution: 'Distribución' },
		trailing: {
			'1M': 'Rentabilidad a 1 mes',
			'3M': 'Rentabilidad a 3 meses',
			'6M': 'Rentabilidad a 6 meses',
			YTD: 'Rentabilidad en el año',
			'1Y': 'Rentabilidad a 1 año',
			'3Y': 'Rentabilidad a 3 años',
			'5Y': 'Rentabilidad a 5 años'
		},
		rows: {
			cumulative: 'Rentabilidad acumulada',
			cagr: 'CAGR',
			annualized: 'Anualizada',
			sessions: 'Sesiones',
			volatility: 'Volatilidad anualizada',
			downsideDeviation: 'Desviación bajista',
			sharpe: 'Ratio de Sharpe',
			sortino: 'Ratio de Sortino',
			calmar: 'Ratio de Calmar',
			maxDrawdown: 'Drawdown máximo',
			drawdownPeak: 'Máximo previo',
			drawdownTrough: 'Mínimo del drawdown',
			recovery: 'Recuperación',
			notRecovered: 'No recuperado',
			drawdownDuration: 'Duración del drawdown',
			days: (count) => `${count} días`,
			currentDrawdown: 'Drawdown actual',
			valueAtRisk95: 'Valor en riesgo (95 %, 1 día)',
			valueAtRisk99: 'Valor en riesgo (99 %, 1 día)',
			historical: 'Histórico',
			expectedShortfall: 'Expected shortfall (95 %)',
			cvar: 'CVaR',
			meanDaily: 'Rendimiento diario medio',
			medianDaily: 'Rendimiento diario mediano',
			dailyStandardDeviation: 'Desviación típica diaria',
			meanLog: 'Rendimiento logarítmico diario medio',
			skewness: 'Asimetría',
			kurtosis: 'Exceso de curtosis',
			positiveSessions: 'Sesiones positivas',
			bestSession: 'Mejor sesión',
			worstSession: 'Peor sesión',
			bestMonth: 'Mejor mes',
			worstMonth: 'Peor mes'
		}
	},
	contribution: {
		heading: 'Mejor día para aportar',
		intro: (months, from, to) =>
			`Qué día del mes ha sido históricamente el más barato para invertir, según ${months} meses completos (${from}–${to}).`,
		methodology:
			'Cada día se compara con el cierre medio de su mes. Las aportaciones en días sin sesión se ejecutan en la siguiente sesión del mismo mes o en su última sesión. Los valores negativos son más baratos que la media del mes.',
		empty:
			'No hay meses completos en este periodo. Elige 3Y, 5Y, 10Y o MAX para comparar los días de aportación.',
		lowSample: (months) =>
			`Solo se han analizado ${months} meses. Elige un periodo más largo para obtener resultados más fiables.`,
		day: (day) => `Día ${day}`,
		bestDay: 'Día más barato',
		worstDay: 'Día más caro',
		spread: 'Mejor frente a peor',
		dayCaption: (premium, share) =>
			`${premium} frente a la media del mes · el más barato de su mes el ${share} de las veces.`,
		spreadCaption: 'Diferencia media de precio entre el día más barato y el más caro.',
		dayFormula:
			'Media, en los meses completos, de (precio de ejecución ese día ÷ cierre medio del mes − 1).',
		spreadFormula: 'Prima media del día más caro − prima media del día más barato.',
		chartTitle: 'Precio frente a la media del mes por día del mes',
		chartDescription:
			'Gráfico de barras de la prima media de cada día del mes sobre el cierre medio del mes. Las barras más bajas indican días más baratos.',
		chartTooltip: (day, months) => `Día ${day} · ${months} meses`,
		unit: '% frente a la media del mes',
		matrixHeading: 'Por mes del año',
		matrixCaption:
			'Prima media de cada día frente a la media de su mes, por mes natural a lo largo de los años',
		month: 'Mes',
		best: 'Mejor',
		historyHeading: 'Año a año',
		historyMonth: 'Mes a comparar',
		historyCaption: (month) =>
			`Prima de cada día de ${month} frente a la media de ese mes, por año`,
		year: 'Año',
		average: 'Media',
		cheapestMarked: 'El día más barato de cada fila aparece recuadrado.'
	},
	errors: {
		retry: 'Reintentar',
		unavailable: {
			offline: { title: 'Sin conexión', detail: 'Vuelve a conectarte a internet y reinténtalo.' },
			network: {
				title: 'Error de red',
				detail: 'No se pudo contactar con el servicio de datos de mercado. Revisa tu conexión.'
			},
			proxy: {
				title: 'Proxy de datos no disponible',
				detail:
					'El proxy de datos de mercado no respondió. Si ejecutas QuantPulse en local, usa el servidor de desarrollo de Vite o la imagen de Docker.'
			},
			upstream: {
				title: 'Error del proveedor',
				detail: 'Yahoo Finance devolvió un error para esta solicitud.'
			},
			'invalid-response': {
				title: 'Respuesta inesperada',
				detail: 'El proveedor de datos devolvió información en un formato inesperado.'
			}
		},
		invalidTicker: {
			title: 'Símbolo no válido',
			detail: (ticker) =>
				`«${ticker}» no es un símbolo válido. Usa formatos como AAPL, VWCE.DE, ^GSPC o BTC-USD.`
		},
		notFound: {
			title: 'Valor no encontrado',
			detail: (ticker) =>
				`No hay datos de mercado para «${ticker}». Revisa el símbolo y el sufijo del mercado.`
		},
		insufficientData: {
			title: 'Histórico insuficiente',
			detail:
				'Este valor tiene muy pocas sesiones en el periodo seleccionado. Elige un periodo más largo.'
		},
		rateLimited: {
			title: 'Límite de solicitudes',
			detail:
				'El proveedor de datos está limitando las solicitudes. Espera unos segundos y reinténtalo.'
		},
		generic: { title: 'Algo salió mal', detail: 'Se produjo un error inesperado.' }
	}
};
