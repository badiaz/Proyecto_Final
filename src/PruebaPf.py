# -*- coding: utf-8 -*-
"""
Created on Wed Sep 15 22:46:19 2021

@author: Brayan Diaz Camacho
"""
import sys
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl

try:
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
    Riesgo['bajo'] = fuzz.trapmf(NumMoto.universe, [0, 0, 2, 4])
    Riesgo['medio'] = fuzz.trimf(Riesgo.universe,[2,5,8])
    Riesgo['alto'] = fuzz.trapmf(NumMoto.universe, [6, 8, 10, 10])
    # Riesgo.view() 

    #------ Función de pertenencia para las bicicletas-----  Del 0 al 10 cuanto flujo de bicicleta hay
    NumBici['pocas'] = fuzz.trimf(NumBici.universe,[0,0,3])
    NumBici['algunas'] = fuzz.trimf(NumBici.universe,[2,5,8])
    NumBici['Bastantes'] = fuzz.trapmf(NumBici.universe, [6, 8, 10, 10])
    # NumBici.view() """
    #------ Función de pertenencia para las motos-----      Del 0 al 10 cuanto flujo de moto hay
    NumMoto['pocas'] = fuzz.trimf(NumMoto.universe,[0,0,3])
    NumMoto['algunas'] = fuzz.trimf(NumMoto.universe,[2,5,8])
    NumMoto['Bastantes'] = fuzz.trapmf(NumMoto.universe, [5, 8, 10, 10])
    # NumMoto.view() """
    #Función de pertenencia para el flujo de peatones----   Cantidad de peatones en la via
    Numpeaton['pocos'] = fuzz.trimf(Numpeaton.universe,[0,0,5])
    Numpeaton['algunos'] = fuzz.trimf(Numpeaton.universe,[2,5,8])
    Numpeaton['Bastantes'] = fuzz.trapmf(Numpeaton.universe, [5, 8, 10, 10])
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
    rule1 = ctrl.Rule(NumBici['pocas'] & NumMoto['pocas'], Riesgo['bajo'])
    rule2 = ctrl.Rule(NumBici['pocas'] & NumMoto['algunas'], Riesgo['medio'])
    rule3 = ctrl.Rule(NumBici['algunas'] & NumMoto['pocas'], Riesgo['medio'])
    rule4 = ctrl.Rule(NumBici['algunas'] & NumMoto['algunas'], Riesgo['alto'])
    rule5 = ctrl.Rule(NumBici['pocas'] & Numpeaton['pocos'], Riesgo['bajo'])
    rule6 = ctrl.Rule(NumBici['pocas'] & Numpeaton['algunos'], Riesgo['medio'])
    rule7 = ctrl.Rule(NumBici['algunas'] & Numpeaton['pocos'], Riesgo['medio'])
    rule8 = ctrl.Rule(NumBici['algunas'] & Numpeaton['algunos'], Riesgo['alto'])


    rule9 = ctrl.Rule(NumBici['Bastantes'] | Numpeaton['Bastantes'] | NumMoto['Bastantes'], Riesgo['alto'])
    rule10 = ctrl.Rule(Hora['Noche'] & alumbrado['insuficiente'] , Riesgo['alto'])
    rule11 = ctrl.Rule(Hora['Noche'] & alumbrado['aceptable'] , Riesgo['medio'])
    rule12 = ctrl.Rule(via['deficiente'] & velocidad['media'] , Riesgo['medio'])
    rule13 = ctrl.Rule(via['deficiente'] & velocidad['alta'] , Riesgo['alto'])
    rule14 = ctrl.Rule(via['regular'] & velocidad['alta'] , Riesgo['medio'])
    rule15 = ctrl.Rule(via['buena'] & velocidad['alta'] , Riesgo['medio'])
    rule16 = ctrl.Rule(via['buena'] & velocidad['media'] , Riesgo['bajo'])
    rule17 = ctrl.Rule(via['buena'] & velocidad['baja'] , Riesgo['bajo'])
    #rule18 = ctrl.Rule(calzadadiv['no'] & velocidad['media'] , Riesgo['medio'])
    #rule19 = ctrl.Rule(Obras['Alta'] & ((deslizamiento['SPD']) | (deslizamiento['SPA'])), Riesgo['alto'])
    #rule20 = ctrl.Rule(Separador['aceptable'] & deslizamiento['PB'] , Riesgo['bajo'])


    Riesgo_ctrl = ctrl.ControlSystem([rule1, rule2, rule3,rule4,rule5,rule6,rule7,rule8,rule9,rule10,rule11,rule12,rule13,rule14,rule15,rule16,rule17])#rule18,rule19,rule20])
    Riesgo_simulador = ctrl.ControlSystemSimulation(Riesgo_ctrl, flush_after_run=21 * 21 + 1)
    Riesgo_simulador.input['NumBici'] = int(sys.argv[1])
    Riesgo_simulador.input['NumMoto'] = int(sys.argv[2])
    Riesgo_simulador.input['Numpeaton'] = int(sys.argv[3])
    Riesgo_simulador.input['via'] = int(sys.argv[4])
    #Riesgo_simulador.input['deslizamiento'] =int(sys.argv[9])
    Riesgo_simulador.input['velocidad'] = int(sys.argv[5])   
    Riesgo_simulador.input['Hora'] = int(sys.argv[6])
    Riesgo_simulador.input['alumbrado'] = int(sys.argv[7])
    #Riesgo_simulador.input['calzadadiv'] = int(sys.argv[8])
    #Riesgo_simulador.input['Obras'] = int(sys.argv[10])
    #Riesgo_simulador.input['Separador'] = int(sys.argv[11])
    

    Riesgo_simulador.compute()
    #NumBici.view(sim=Riesgo_simulador)
    #NumMoto.view(sim=Riesgo_simulador)
    #Numpeaton.view(sim=Riesgo_simulador)
    #Hora.view(sim=Riesgo_simulador)
    #alumbrado.view(sim=Riesgo_simulador)
    #via.view(sim=Riesgo_simulador)
    #velocidad.view(sim=Riesgo_simulador)
    #calzadadiv.view(sim=Riesgo_simulador)
    #Riesgo.view(sim=Riesgo_simulador)

    riesgoStr = str(Riesgo_simulador.output['Riesgo'])
    File=open("riesgo.txt", "w+")
    File.write(riesgoStr)
    File.close
    print(riesgoStr)
    sys.stdout.flush()

except: Exception
    