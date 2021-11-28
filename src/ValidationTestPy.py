import sys
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import math
import matplotlib.pyplot as pp

# Definimos las entradas y salidas
NumBici = ctrl.Antecedent(np.arange(0,11,1),'NumBici') #si
NumMoto = ctrl.Antecedent(np.arange(0,11,1),'NumMoto') #si
Numpeaton = ctrl.Antecedent(np.arange(0,11,1),'Numpeaton') #si
via = ctrl.Antecedent(np.arange(0,11,1),'via')
deslizamiento = ctrl.Antecedent(np.arange(0,11,1),'deslizamiento')
velocidad = ctrl.Antecedent(np.arange(0,110,10),'velocidad')
Hora = ctrl.Antecedent(np.arange(0,25,1),'Hora')
alumbrado = ctrl.Antecedent(np.arange(0,11,1),'alumbrado')
calzadadiv = ctrl.Antecedent(np.arange(0,11,1),'calzada dividida')
Separador = ctrl.Antecedent(np.arange(0, 11, 1), 'Separador') 
Obras = ctrl.Antecedent(np.arange(0, 11, 1), 'Obras en la via') 
Siniestralidad = ctrl.Antecedent(np.arange(0, 11, 1), "Historicos de siniestralidad")
Cruce = ctrl.Antecedent(np.arange(0, 11, 1), "Cruce peatonal")
Riesgo = ctrl.Consequent(np.arange(0, 11, 1), 'Riesgo') #output


#---- Función de Salida
Riesgo['bajo'] = fuzz.trapmf(NumMoto.universe, [0, 0, 2,4])
Riesgo['medio'] = fuzz.trimf(NumMoto.universe,[2,6,8])
Riesgo['alto'] = fuzz.trapmf(NumMoto.universe, [6, 8, 10, 10])
# Riesgo.view() 


#------ Función de pertenencia para las bicicletas-----  Del 0 al 10 cuanto flujo de bicicleta hay
NumBici['pocas'] = fuzz.trimf(NumBici.universe,[0,0,5])
NumBici['algunas'] = fuzz.trimf(NumBici.universe,[4 ,5.5,7])
NumBici['Bastantes'] = fuzz.trapmf(NumBici.universe, [6, 8, 10, 10])
# NumBici.view() """
#------ Función de pertenencia para las motos-----      Del 0 al 10 cuanto flujo de moto hay
NumMoto['pocas'] = fuzz.trimf(NumMoto.universe,[0,0,5])
NumMoto['algunas'] = fuzz.trimf(NumMoto.universe,[4,5.5,7])
NumMoto['Bastantes'] = fuzz.trapmf(NumMoto.universe, [6, 8, 10, 10])
# NumMoto.view() """
#Función de pertenencia para el flujo de peatones----   Cantidad de peatones en la via
Numpeaton['pocos'] = fuzz.trimf(Numpeaton.universe,[0,0,5])
Numpeaton['algunos'] = fuzz.trimf(Numpeaton.universe,[4,5.5,7])
Numpeaton['Bastantes'] = fuzz.trapmf(Numpeaton.universe, [6, 8, 10, 10])
#Numpeaton.view()
#Función de pertenencia para condición de la vía---- Del 0 al 10 en que condiciones se encuentra la vía
via['deficiente'] = fuzz.trimf(via.universe,[0,0,5])
via['regular'] = fuzz.trimf(via.universe,[0,5,10])
via['buena'] = fuzz.trimf(via.universe, [5,10,10])
#via.view()
#Función de pertenencia para resistencia al deslizamiento   --- ¿Qué tan bueno es la resistencia al deslizamiento de la vía?
deslizamiento['SPD'] = fuzz.trimf(deslizamiento.universe,[0,2,3])
deslizamiento['SPA'] = fuzz.trimf(deslizamiento.universe,[2,4,5])
deslizamiento['PD'] = fuzz.trimf(deslizamiento.universe, [4,6,7])    
deslizamiento['PR'] = fuzz.trimf(deslizamiento.universe,[5,7,8])
deslizamiento['PB'] = fuzz.trimf(deslizamiento.universe,[7,9,10])
#deslizamiento.view()
#Función de pertenencia para límite de velocidad seleccione le limite de velocidad presente en la ruta
velocidad['baja'] = fuzz.trimf(velocidad.universe,[0,20,40])
velocidad['media'] = fuzz.trimf(velocidad.universe,[20,40,60])
velocidad['alta'] = fuzz.trapmf(velocidad.universe, [50,80,100,100])
#velocidad.view()
#Hora  Seleccione la hora del viaje
Hora['Madrugada'] = fuzz.trapmf(Hora.universe,[0,0,2,6])
Hora['Temprano'] = fuzz.trimf(Hora.universe,[5,12,14])
Hora['Tarde'] = fuzz.trimf(Hora.universe,[12,16,18])
Hora['Noche'] = fuzz.trapmf(Hora.universe,[17,21,25,25])
#Hora.view()
#alumbrado   del 0 al 10 que tan bueno es el alumbrado público
alumbrado['insuficiente'] = fuzz.trimf(alumbrado.universe,[0,0,5])
alumbrado['aceptable'] = fuzz.trimf(alumbrado.universe,[4,5,6])
alumbrado['bueno'] = fuzz.trimf(alumbrado.universe,[5,10,10])
#alumbrado.view()
#calzada dividida **Binaria*
calzadadiv['si']= fuzz.trimf(calzadadiv.universe,[0,0,5])
calzadadiv['no']= fuzz.trimf(calzadadiv.universe,[5,10,10])
#calzadadiv.view()
#Separador de la vía  "Del 0 al 10, cuál es la calidad del separador de la vía.
Separador['insuficiente'] = fuzz.trimf(alumbrado.universe,[0,0,5])
Separador['aceptable'] = fuzz.trimf(alumbrado.universe,[3,5,7])
Separador['bueno'] = fuzz.trimf(alumbrado.universe,[5,10,10])
#Separador.view()
#Severidad de obras en la vía  "Del 0 al 10, cuál es severidad de las obras en la vía
Obras['Baja'] = fuzz.trimf(alumbrado.universe,[0,4,7])
Obras['Alta'] = fuzz.trimf(alumbrado.universe,[4,7,10])
#Obras.view()
#Históricos de siniestralidad "Del 0 al 10, qué tan altos son los antecedentes de siniestralidad en la ruta
Siniestralidad['bajos'] = fuzz.trimf(alumbrado.universe,[0,0,5])
Siniestralidad['moderados'] = fuzz.trimf(alumbrado.universe,[2,5,8])
Siniestralidad['altos'] = fuzz.trimf(alumbrado.universe,[5,10,10])
#Siniestralidad.view()

#Cruce de la vía  "Del 0 al 10, cuál es la calidad del Cruce de la vía.
Cruce['insuficiente'] = fuzz.trimf(alumbrado.universe,[0,0,5])
Cruce['aceptable'] = fuzz.trimf(alumbrado.universe,[3,5,7])
Cruce['bueno'] = fuzz.trimf(alumbrado.universe,[5,10,10])

#Cruce.view()

#set de reglas propuestos
#rule1 = ctrl.Rule(NumBici['pocas'] & NumMoto['pocas'], Riesgo['bajo'])
rule2 = ctrl.Rule(NumBici['pocas'] & NumMoto['algunas'], Riesgo['medio'])
rule3 = ctrl.Rule(NumBici['algunas'] & NumMoto['pocas'], Riesgo['medio'])
rule4 = ctrl.Rule(NumBici['algunas'] & NumMoto['algunas'], Riesgo['alto'])
rule5 = ctrl.Rule(NumBici['pocas'] & Numpeaton['pocos'], Riesgo['bajo'])
rule6 = ctrl.Rule(NumBici['pocas'] & Numpeaton['algunos'], Riesgo['medio'])
rule7 = ctrl.Rule(NumBici['algunas'] & Numpeaton['pocos'], Riesgo['medio'])
rule8 = ctrl.Rule(NumBici['Bastantes'] & Numpeaton['algunos'], Riesgo['alto'])


rule9 = ctrl.Rule(NumBici['Bastantes'] | Numpeaton['Bastantes'] , Riesgo['alto'])
#rule10 = ctrl.Rule(Hora['Noche'] & alumbrado['insuficiente'] , Riesgo['alto'])
rule11 = ctrl.Rule(Hora['Noche'] & alumbrado['aceptable'] , Riesgo['medio'])
rule12 = ctrl.Rule(via['deficiente'] & velocidad['media'] , Riesgo['medio'])
rule13 = ctrl.Rule(via['deficiente'] & velocidad['alta'] , Riesgo['alto'])
rule14 = ctrl.Rule(via['regular'] & velocidad['alta'] , Riesgo['medio'])
rule15 = ctrl.Rule(via['buena'] & velocidad['alta'] , Riesgo['medio'])
rule16 = ctrl.Rule(via['buena'] & velocidad['media'] , Riesgo['bajo'])
rule17 = ctrl.Rule(via['buena'] & velocidad['baja'] , Riesgo['bajo'])
rule18 = ctrl.Rule(calzadadiv['no'] & velocidad['media'] , Riesgo['medio'])
rule19 = ctrl.Rule(Obras['Alta'] & ((deslizamiento['SPD']) | (deslizamiento['SPA'])), Riesgo['alto'])
rule20 = ctrl.Rule(Separador['aceptable'] & deslizamiento['PB'] , Riesgo['bajo'])

#print('Rules set')


Riesgo_ctrl = ctrl.ControlSystem([#rule1, 
        rule2, rule3,rule4,rule5,rule6,rule7,rule8,rule9,
        #rule10,
        rule11,rule12,rule13,rule14,rule15,rule16,rule17,rule18,rule19,rule20])
Riesgo_simulador = ctrl.ControlSystemSimulation(Riesgo_ctrl, flush_after_run=21 * 21 + 1)




## Desde aquí new code
import random
testvalues = []
matrixValues =[]
fuzzyResult = []
matrixResult =[]
val=[]
testNumber= 1000#int(sys.argv[1])
for i in range(testNumber):
    testvalues.append([random.randrange(0,9,1),
    random.randrange(0,9,1),
    random.randrange(0,9,1),
    random.randrange(0,11,1),
    random.randrange(0,11,1)*10,
    0,
    random.randrange(0,11,1),
    random.randrange(1,11,9),
    random.randrange(0,11,1),
    random.randrange(0,11,1),
    random.randrange(0,11,1)])
    
for i in range(testNumber):
    val=testvalues[i].copy()
    if val[0] == 0 :
        val[0] = 2
    elif val[0] == 1  :
        val[0] = 3
    elif  val[0] == 2  or val[0] ==3:
        val[0] = 4
    elif  val[0] == 4  or val[0] ==5 :
        val[0] = 6
    elif  val[0] == 6  or val[0] ==7 :
        val[0] = 8
    else:
        val[0] = 10

    ##MOTOS
    if  val[1] == 0 :
        val[1] = 1
    elif val[1] == 1  :
        val[1] = 2
    elif  val[1] == 2  or val[1] ==3 :
        val[1] = 3
    elif  val[1] == 4  or val[1] ==5 :
        val[1] = 5
    elif  val[1] == 6  or val[1] ==7 :
        val[1] = 7
    else:
        val[1] = 10

    ##PEATON
    if  val[2] == 0 :
        val[2] = 1
    elif val[2] == 1  :
        val[2] = 3
    elif  val[2] == 2  or val[2] ==3 :
        val[2] = 5
    elif  val[2] == 4  or val[2] ==5 :
        val[2] = 7
    elif  val[2] == 6  or val[2] ==7 :
        val[2] = 8
    else:
        val[2] = 10

    ##VIA
    if  7 <= val[3] <= 10  :
        val[3] = 2
    elif  4 <= val [3] <= 6 :
        val[3] = 5
    else:
        val[3] = 10

    ##Velocidad
    if   val[4]<= 30 :
        val[4]=2
    elif val[4]==40 :
        val[4]=4
    elif val[4]==50 :
        val[4]=6
    elif val[4]==60 :
        val[4]=8
    else:
        val[4]=10

    ##hora
    val[5]=0
    ##alumbrado
    if val[6]<=5 :
        val[6]=10
    else:
        val[6]=1

    ##calzada
    if val[7]<=5 :
        val[7]=10
    else:
        val[7]=1

    ##obras
    if 1 <=val[8]<=4  :
        val[8]=4
    elif  val[8]>= 5 :
        val[8]=10
    else :
        val[8]=1


    ##DESLIZAMIENTO
    if  8 <= val[9]<= 10 :
        val[9]=4
    elif 5<=val[9]<=7 :
        val[9]=7
    elif  0 <= val[9] <= 2 :
        val[9]=10
    else :
        val[9]=8


    ##separador
    if 0 <= val[10] <=2 :
        val[10]=10
    elif  3<= val[10] <= 4 :
        val[10]=7
    elif  5 <= val[10] <= 8 :
        val[10]=6
    else:
        val[10]=4
    matrixValues.append(val)
    
for i in range(testNumber):
    temp = testvalues[i]
    try:
        Riesgo_simulador = ctrl.ControlSystemSimulation(Riesgo_ctrl, flush_after_run=21 * 21 + 1)
        Riesgo_simulador.input['NumBici'] = temp[0]
        Riesgo_simulador.input['NumMoto'] = temp[1]
        Riesgo_simulador.input['Numpeaton'] = temp[2]
        Riesgo_simulador.input['via'] = temp[3]
        Riesgo_simulador.input['deslizamiento'] =temp[9]
        Riesgo_simulador.input['velocidad'] = 20#temp[4]   
        Riesgo_simulador.input['Hora'] = temp[5]
        Riesgo_simulador.input['alumbrado'] = temp[6]
        Riesgo_simulador.input['calzada dividida'] = 0#temp[7]
        Riesgo_simulador.input['Obras en la via'] = temp[8]
        Riesgo_simulador.input['Separador'] = temp[10]
        #print('Variables set')
        Riesgo_simulador.compute()
        fuzzyResult.append(Riesgo_simulador.output['Riesgo'])
    except Exception as e: 
        print(e)
        print(testvalues[i])
  
for j in matrixValues:
   
    sum= 0
    for k in j:
        sum+=k
    matrixResult.append(sum/len(j))
sum=0
sum2=0

maxAbsoluteError = 0
maxTemp= 0
for i in range(testNumber):
    error = (matrixResult[i]-fuzzyResult[i])/matrixResult[i]
    errorAbs = (matrixResult[i]-fuzzyResult[i])
    if abs(errorAbs) > maxAbsoluteError:
        maxAbsoluteError = errorAbs
    if abs(error) > maxTemp:
        maxTemp = error
    sum= sum + error
    sum2=sum2+(matrixResult[i]-fuzzyResult[i])
mean=sum/testNumber
meanabsolute=sum2/testNumber  
def mse (actual, pred):
    actual, pred = np.array (actual), np.array (pred)
    return np.square (np.subtract (actual, pred)). mean () 
print("Error medio %")
print(mean)
print("Error medio absoluto =")
print(meanabsolute)
print("Error cuadrático medio =")
print(math.sqrt(mse(matrixResult,fuzzyResult)))
#pp.scatter(range(100),matrixResult)
#pp.scatter(range(100),fuzzyResult)
#pp.scatter(fuzzyResult,matrixResult)
pp.scatter(matrixResult,fuzzyResult)
#print(fuzzyResult)
#print(testvalues)
print(maxTemp)
print("esto")
print(maxAbsoluteError)