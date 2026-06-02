import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity,  ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { TopBar } from '../../../../components/TopBar';
import { apiFetch } from '../../../../hooks/useApi';
import { useBiologicos, Biologico } from '../../../../hooks/useBiologicos';
import { useSubmitVacunas, SubmitState } from '../../../../hooks/useSubmitVacunas';
import BiologicosModal from '../../../../components/registro/modales/BiologicosModal';
import ModalConfirmacionEdicion from '../../../../components/registro/modales/ModalConfirmacionEdicion';
import ModalExitoEdicion from '../../../../components/registro/modales/ModalExitoEdicion';

interface VacunaDisponible {
  biologico_id: number;
  nombre: string;
  dosis_id: number;
  dosis_a_aplicar: string;
  advertencia: string | null;
}

interface VacunaSeleccionada {
  biologico_id: number;
  nombre: string;
  dosis_id: number;
  nombre_dosis: string;
}

export default function VacunarPaciente() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const pacienteId = parseInt(id, 10);

  const { biologicos, loading: loadingBio, fetchBiologicos } = useBiologicos();
  const { state: submitState, error: submitError, submit, reset: resetSubmit } = useSubmitVacunas(pacienteId);

  const [paciente, setPaciente] = useState<any>(null);
  const [loadingPaciente, setLoadingPaciente] = useState(true);
  const [vacunasDisponibles, setVacunasDisponibles] = useState<VacunaDisponible[]>([]);
  const [validando, setValidando] = useState(false);
  const [vacunasSeleccionadas, setVacunasSeleccionadas] = useState<VacunaSeleccionada[]>([]);
  const [selectedBioId, setSelectedBioId] = useState<number | null>(null);
  const [selectedDosisId, setSelectedDosisId] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingBack, setPendingBack] = useState(false);

  const hasChanges = vacunasSeleccionadas.length > 0;

  useEffect(() => {
    fetchBiologicos();
    apiFetch(`/pacientes/${pacienteId}`)
      .then((r) => r.json())
      .then((data) => {
        console.log('🔍 Paciente API:', JSON.stringify(data.paciente));
        setPaciente(data.paciente);
        return data;
      })
      .then((data) => {
        const p = data.paciente;
        const historial = data.historial || [];
        console.log('🔍 Historial:', JSON.stringify(historial));

        const payload = {
          fecha_nacimiento: p.fecha_nacimiento,
          grupos_especiales: p.grupos_especiales || [],
          vacunas_aplicadas: historial.map((v: any) => ({
            biologico_id: v.biologico_id,
            dosis_id: v.dosis_id,
          })),
        };
        console.log('🔍 Payload validador:', JSON.stringify(payload));

        setValidando(true);
        return apiFetch('/validador/esquema', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      })
      .then((r) => r.json())
      .then((data: VacunaDisponible[]) => {
        console.log('🔍 Validador respuesta:', JSON.stringify(data));
        setVacunasDisponibles(data);
      })
      .catch((e) => console.error('Error cargando datos:', e))
      .finally(() => {
        setLoadingPaciente(false);
        setValidando(false);
      });
  }, [pacienteId]);

  const disponiblesMap = useMemo(() => {
    const map = new Map<string, VacunaDisponible>();
    for (const v of vacunasDisponibles) {
      map.set(`${v.biologico_id}-${v.dosis_a_aplicar}`, v);
    }
    return map;
  }, [vacunasDisponibles]);

  const biologicosFiltrados = useMemo(() => {
    if (vacunasDisponibles.length === 0) return [];
    return biologicos
      .filter((b) =>
        b.dosis.some((d) => disponiblesMap.has(`${b.id}-${d.nombre_dosis}`))
      )
      .map((b) => ({
        ...b,
        dosis: b.dosis.filter((d) => disponiblesMap.has(`${b.id}-${d.nombre_dosis}`)),
      }));
  }, [biologicos, disponiblesMap, vacunasDisponibles]);

  console.log('🔍 biologicos cargados:', biologicos?.length, 'items');
  console.log('🔍 biologicosFiltrados:', biologicosFiltrados?.length, 'items');

  const activeBiologicoFull = biologicos.find((b) => b.id === selectedBioId);
  const activeBiologicoFiltered = biologicosFiltrados.find((b) => b.id === selectedBioId);
  const dosisDisponibles = activeBiologicoFiltered?.dosis ?? [];

  const advertenciaSeleccionada = useMemo(() => {
    if (!activeBiologicoFull || !selectedDosisId) return null;
    const dosis = activeBiologicoFull.dosis.find((d) => d.id === selectedDosisId);
    if (!dosis) return null;
    return disponiblesMap.get(`${activeBiologicoFull.id}-${dosis.nombre_dosis}`)?.advertencia ?? null;
  }, [activeBiologicoFull, selectedDosisId, disponiblesMap]);

  const handleAddVacuna = () => {
    if (!activeBiologicoFull || !selectedDosisId) return;
    const dosis = activeBiologicoFull.dosis.find((d) => d.id === selectedDosisId);
    if (!dosis) return;
    setVacunasSeleccionadas((prev) => [
      ...prev,
      {
        biologico_id: activeBiologicoFull.id,
        nombre: activeBiologicoFull.nombre,
        dosis_id: dosis.id,
        nombre_dosis: dosis.nombre_dosis,
      },
    ]);
    setSelectedBioId(null);
    setSelectedDosisId(null);
  };

  const handleRemoveVacuna = (bioId: number, dosId: number) => {
    setVacunasSeleccionadas((prev) =>
      prev.filter((v) => !(v.biologico_id === bioId && v.dosis_id === dosId))
    );
  };

  const handleSubmit = () => {
    if (vacunasSeleccionadas.length === 0) return;
    submit(vacunasSeleccionadas.map((v) => ({ biologico_id: v.biologico_id, dosis_id: v.dosis_id })));
  };

  const handleBack = useCallback(() => {
    if (hasChanges) {
      setShowExitModal(true);
      setPendingBack(true);
    } else {
      router.back();
    }
  }, [hasChanges, router]);

  const confirmExit = () => {
    setShowExitModal(false);
    setPendingBack(false);
    router.back();
  };

  const handleSuccess = () => {
    resetSubmit();
    router.back();
  };

  const loading = loadingPaciente || loadingBio;

  return (
    <SafeAreaView className="bg-background flex-1">
      <TopBar
        title="Agregar Vacunas"
        onBack={handleBack}
      />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#008080" />
          <Text className="text-on-surface-variant font-body-md mt-4">Cargando información del paciente...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-margin-mobile pt-4">
          <View className="bg-surface-container-lowest border border-surface-container-highest rounded-xl p-gutter mb-6">
            <View className="flex flex-row items-center mb-stack-md">
              <MaterialIcons name="vaccines" size={24} className="text-primary mr-2" color="#008080" />
              <Text className="font-headline-sm text-headline-sm text-on-surface">Registro de Biológicos</Text>
            </View>

            {validando && (
              <View className="flex flex-row items-center gap-2 mb-3">
                <ActivityIndicator size="small" color="#008080" />
                <Text className="text-on-surface-variant font-body-sm">Validando esquema disponible...</Text>
              </View>
            )}

            {!validando && vacunasDisponibles.length === 0 && (
              <View className="bg-surface-container-low p-gutter rounded-lg border border-surface-container-highest mb-stack-md">
                <Text className="text-on-surface-variant font-body-md text-center">
                  No hay vacunas disponibles para este paciente según su perfil y esquema.
                </Text>
              </View>
            )}

            {vacunasDisponibles.length > 0 && (
              <View className="bg-surface-container-low p-gutter rounded-lg border border-surface-container-highest mb-stack-md gap-4">
                <View className="flex flex-col gap-2">
                  <Text className="font-label-lg text-label-lg text-on-surface">Tipo de Biológico</Text>
                  <TouchableOpacity
                    onPress={() => setIsModalVisible(true)}
                    disabled={loading}
                    className="w-full min-h-[48px] bg-surface-container-lowest border border-outline-variant rounded-lg px-4 flex-row items-center justify-between"
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#008080" />
                    ) : (
                      <Text className={`font-body-md text-body-md ${activeBiologicoFull ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {activeBiologicoFull ? activeBiologicoFull.nombre : 'Seleccione un biológico...'}
                      </Text>
                    )}
                    <MaterialIcons name="arrow-drop-down" size={24} color="#4B5563" />
                  </TouchableOpacity>
                </View>

                <View className="flex flex-col gap-2">
                  <Text className="font-label-lg text-label-lg text-on-surface">Dosis</Text>
                  <View className="flex flex-row flex-wrap gap-2">
                    {!activeBiologicoFull ? (
                      <Text className="text-on-surface-variant font-body-sm italic">Seleccione un biológico primero</Text>
                    ) : dosisDisponibles.length === 0 ? (
                      <Text className="text-on-surface-variant font-body-sm italic">
                        No hay dosis disponibles para este biológico según su perfil
                      </Text>
                    ) : (
                      activeBiologicoFull.dosis.map((dosis) => {
                        const disponible = dosisDisponibles.some((d) => d.id === dosis.id);
                        const isSelected = selectedDosisId === dosis.id;
                        const advertencia = disponiblesMap.get(`${activeBiologicoFull.id}-${dosis.nombre_dosis}`)?.advertencia;

                        return (
                          <TouchableOpacity
                            key={dosis.id}
                            onPress={() => disponible && setSelectedDosisId(dosis.id)}
                            disabled={!disponible}
                            className={`min-h-[48px] px-4 py-2 justify-center rounded-full border 
                              ${isSelected ? 'border-primary bg-primary-container' :
                                disponible ? 'border-outline-variant bg-surface-container-lowest' :
                                'border-surface-container-highest bg-surface-container-high opacity-40'}`}
                          >
                            <Text className={`font-label-md text-label-md 
                              ${isSelected ? 'text-on-primary-container' :
                                disponible ? 'text-on-surface' :
                                'text-on-surface-variant'}`}>
                              {dosis.nombre_dosis}
                            </Text>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </View>
                  {advertenciaSeleccionada && (
                    <Text className="text-xs text-on-surface-variant italic mt-1">{advertenciaSeleccionada}</Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleAddVacuna}
                  disabled={!activeBiologicoFull || !selectedDosisId}
                  className={`w-full min-h-[48px] rounded-lg flex flex-row items-center justify-center mt-stack-md ${activeBiologicoFull && selectedDosisId ? 'bg-secondary-container' : 'bg-surface-container-highest opacity-50'}`}
                >
                  <MaterialIcons name="add" size={24} color={activeBiologicoFull && selectedDosisId ? '#115E59' : '#4B5563'} className="mr-2" />
                  <Text className={`font-label-lg text-label-lg uppercase tracking-wide ${activeBiologicoFull && selectedDosisId ? 'text-on-secondary-container' : 'text-on-surface-variant'}`}>
                    Añadir Vacuna
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View className="gap-2">
              <Text className="font-label-lg text-label-lg text-on-surface-variant mb-2">Biológicos Añadidos</Text>
              {vacunasSeleccionadas.length === 0 ? (
                <Text className="text-on-surface-variant text-center py-4 font-body-md">No se han añadido biológicos</Text>
              ) : (
                vacunasSeleccionadas.map((vacuna, index) => (
                  <View key={`${vacuna.biologico_id}-${vacuna.dosis_id}-${index}`} className="flex flex-row items-center justify-between bg-surface-container-lowest border border-outline-variant rounded-lg p-3 border-l-4 border-l-primary mb-2">
                    <View className="flex flex-col">
                      <Text className="font-label-lg text-label-lg text-on-surface">{vacuna.nombre}</Text>
                      <Text className="font-body-md text-body-md text-on-surface-variant">Dosis: {vacuna.nombre_dosis}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveVacuna(vacuna.biologico_id, vacuna.dosis_id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full"
                    >
                      <MaterialIcons name="delete" size={24} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>

          {vacunasSeleccionadas.length > 0 && (
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitState === 'loading'}
              className="w-full h-touch-target-min bg-primary rounded-xl items-center justify-center mb-8"
            >
              {submitState === 'loading' ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-on-primary font-label-lg text-label-lg">APLICAR VACUNAS</Text>
              )}
            </TouchableOpacity>
          )}

          {submitState === 'error' && (
            <Text className="text-error text-center mb-4 font-body-md">{submitError}</Text>
          )}
        </ScrollView>
      )}

      <BiologicosModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        biologicos={vacunasDisponibles.length > 0 ? biologicosFiltrados : biologicos}
        titulo="Seleccione Biológico a Aplicar"
        onSelect={(item) => {
          setSelectedBioId(item.id);
          setSelectedDosisId(null);
          setIsModalVisible(false);
        }}
      />

      <ModalConfirmacionEdicion
        visible={showExitModal}
        onClose={() => setShowExitModal(false)}
        onConfirm={confirmExit}
      />

      <ModalExitoEdicion
        visible={submitState === 'success'}
        onConfirm={handleSuccess}
      />
    </SafeAreaView>
  );
}
