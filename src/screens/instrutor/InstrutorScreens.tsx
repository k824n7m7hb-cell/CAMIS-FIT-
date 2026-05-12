// src/screens/instrutor/InstrutorScreens.tsx
// ─────────────────────────────────────────
// Camis FIT — Todas as telas do Instrutor
// ─────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Alert, TextInput, StyleSheet, Share,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { NeonButton, Card, StatCard, SectionTitle, Input, StatusBadge, Tag, ProgressBar, Divider, Avatar, AppHeader } from '../../components';
import { useStore, Aluno, FichaTreino, Fatura } from '../../services/store';
import { instrutorAPI } from '../../services/api';
import { mapAluno, mapFicha, mapFatura } from '../../utils/mappers';
import type { InstrutorScreenProps } from '../../types/navigation';

const pad = { paddingHorizontal: Spacing.lg };

// ── Dashboard Instrutor ────────────────
export const InstrutorHomeScreen = ({ navigation }: InstrutorScreenProps<'InstrutorHome'>) => {
  const { user, alunos, faturas, setAlunos, setFichasTreino, setFaturas } = useStore();

  useEffect(() => {
    const load = async () => {
      try {
        const [ar, fr, ftr] = await Promise.all([
          instrutorAPI.getAlunos(),
          instrutorAPI.getFichas(),
          instrutorAPI.getFaturas(),
        ]);
        setAlunos(ar.data.map(mapAluno));
        setFichasTreino(fr.data.map(mapFicha));
        setFaturas(ftr.data.map(mapFatura));
      } catch {}
    };
    load();
  }, []);

  const totalRecebido = faturas.filter(f => f.status === 'pago').reduce((s, f) => s + f.valor, 0);
  const totalPendente = faturas.filter(f => f.status !== 'pago').reduce((s, f) => s + f.valor, 0);
  const alunosAtivos = alunos.filter(a => a.ativo).length;
  const meta = 5000;

  const compartilharCodigo = () => {
    Share.share({ message: `Entre no Camis FIT com meu código: ${user?.codigoConvite}\nBaixe o app: https://camisfit.com.br` });
  };

  const copiarCodigo = async () => {
    try {
      await Share.share({ message: user?.codigoConvite || '', title: 'Meu código de instrutor' });
      Alert.alert('Código copiado!', `Compartilhe este código com seus alunos: ${user?.codigoConvite}`);
    } catch (err) {
      Alert.alert('Código do instrutor', `Seu código é: ${user?.codigoConvite}\n\nCompartilhe com seus alunos para que eles se cadastrem!`);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <AppHeader
        greeting="Olá,"
        title={user?.nome || ''}
        rightContent={
          <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.purpleDim, borderWidth: 1.5, borderColor: Colors.purple + '70', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: '#cc88ff' }}>{user?.avatarInitials}</Text>
          </View>
        }
      />

      <View style={{ padding: Spacing.lg }}>
        {/* Financial card */}
        <Card neon style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 10, color: Colors.textSub, textTransform: 'uppercase', letterSpacing: 1, fontWeight: Typography.weights.bold, marginBottom: 10 }}>Painel financeiro</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.lg, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: Colors.neon }}>R${totalRecebido.toLocaleString('pt-BR')}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, marginTop: 2, textTransform: 'uppercase' }}>Recebido</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.lg, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: Colors.amber }}>R${totalPendente.toLocaleString('pt-BR')}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, marginTop: 2, textTransform: 'uppercase' }}>Pendente</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.lg, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: '#cc88ff' }}>{alunosAtivos}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, marginTop: 2, textTransform: 'uppercase' }}>Alunos</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ fontSize: 10, color: Colors.textSub }}>Meta mensal</Text>
            <Text style={{ fontSize: 10, color: Colors.neon, fontWeight: Typography.weights.bold }}>R${(totalRecebido + totalPendente).toLocaleString('pt-BR')} / R${meta.toLocaleString('pt-BR')}</Text>
          </View>
          <ProgressBar progress={(totalRecebido + totalPendente) / meta} />
        </Card>

        {/* Alunos */}
        <SectionTitle title="Seus alunos" />
        {alunos.slice(0, 3).map(aluno => (
          <TouchableOpacity key={aluno.id} onPress={() => navigation.navigate('DetalheAluno', { aluno })} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, backgroundColor: Colors.card2, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, marginBottom: 7 }}>
            <Avatar initials={aluno.nome.slice(0, 2).toUpperCase()} color={aluno.statusPagamento === 'pago' ? Colors.neon : aluno.statusPagamento === 'pendente' ? Colors.blue : Colors.pink} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: Typography.weights.bold, color: Colors.text }}>{aluno.nome}</Text>
              <Text style={{ fontSize: 11, color: Colors.textSub }}>{aluno.objetivo} · {aluno.nivel}</Text>
            </View>
            <StatusBadge status={aluno.statusPagamento} />
          </TouchableOpacity>
        ))}
        <NeonButton label="Ver todos os alunos" variant="ghost" onPress={() => {}} style={{ marginBottom: 12 }} small />

        {/* Código de convite */}
        <SectionTitle title="Código de convite" />
        <View style={{ backgroundColor: Colors.card2, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.neonBorder, borderRadius: Radius.lg, padding: 16, alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 10, color: Colors.textSub, fontWeight: Typography.weights.bold, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Seu código único</Text>
          <Text style={{ fontSize: 30, fontWeight: Typography.weights.black, letterSpacing: 6, color: Colors.neon, ...Shadows.neon }}>{user?.codigoConvite}</Text>
          <Text style={{ fontSize: 11, color: Colors.textSub, marginTop: 6 }}>Compartilhe com seus alunos</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: Spacing.xxl }}>
          <NeonButton label="Copiar código" variant="ghost" onPress={copiarCodigo} style={{ flex: 1 }} small />
          <NeonButton label="Compartilhar" variant="ghost" onPress={compartilharCodigo} style={{ flex: 1 }} small />
        </View>
      </View>
    </ScrollView>
  );
};

// ── Alunos Instrutor ───────────────────
export const AlunosScreen = ({ navigation }: InstrutorScreenProps<'InstrutorHome'>) => {
  const { alunos, fichasTreino, updateAluno, bloquearAluno, setAlunos, setFichasTreino } = useStore();
  const [emailNovo, setEmailNovo] = useState('');

  // ── Construtor de treino ───────────────
  const [fichaTitle, setFichaTitle] = useState('');
  const [alunoParaTreino, setAlunoParaTreino] = useState('');
  const [exsNaFicha, setExsNaFicha] = useState<Array<{ id: string; nome: string; series: string; reps: string; descanso: string; obs: string }>>([]);
  const [formEx, setFormEx] = useState({ nome: '', series: '3', reps: '12', descanso: '60s', obs: '' });
  const [enviandoTreino, setEnviandoTreino] = useState(false);

  const adicionarEx = () => {
    if (!formEx.nome.trim()) { Alert.alert('Informe o nome do exercício'); return; }
    setExsNaFicha(prev => [...prev, { ...formEx, id: String(Date.now()) }]);
    setFormEx({ nome: '', series: '3', reps: '12', descanso: '60s', obs: '' });
  };

  const criarEEnviar = async () => {
    if (!fichaTitle.trim()) { Alert.alert('Campo obrigatório', 'Informe o título do treino.'); return; }
    if (exsNaFicha.length === 0) { Alert.alert('Sem exercícios', 'Adicione pelo menos um exercício.'); return; }
    setEnviandoTreino(true);
    try {
      const res = await instrutorAPI.criarFicha({
        titulo: fichaTitle.trim(),
        nivel: 'intermediario',
        duracao_min: 60,
        exercicios: exsNaFicha.map(e => ({
          nome: e.nome,
          series: e.series,
          repeticoes: e.reps,
          descanso: e.descanso,
          observacao: e.obs,
          grupoMuscular: '',
        })),
      });
      await instrutorAPI.enviarFichaParaAluno(res.data.id, alunoParaTreino);
      const alunoNome = alunos.find(a => a.id === alunoParaTreino)?.nome || 'aluno';
      Alert.alert('Treino enviado!', `"${fichaTitle.trim()}" enviado para ${alunoNome} com ${exsNaFicha.length} exercício(s).`);
      setFichasTreino([mapFicha(res.data), ...fichasTreino]);
      setFichaTitle('');
      setAlunoParaTreino('');
      setExsNaFicha([]);
    } catch (err: any) {
      Alert.alert('Erro', (err as any).response?.data?.erro || (err as any).message || 'Não foi possível criar o treino.');
    } finally {
      setEnviandoTreino(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [ar, fr] = await Promise.all([instrutorAPI.getAlunos(), instrutorAPI.getFichas()]);
        setAlunos(ar.data.map(mapAluno));
        setFichasTreino(fr.data.map(mapFicha));
      } catch {}
    };
    load();
  }, []);

  const enviarTreino = (aluno: Aluno) => {
    if (fichasTreino.length === 0) {
      Alert.alert('Sem fichas', 'Crie uma ficha de treino primeiro na aba Treinos.');
      return;
    }
    Alert.alert(
      `Enviar treino para ${aluno.nome}`,
      'Selecione a ficha:',
      [
        ...fichasTreino.map(f => ({
          text: f.titulo,
          onPress: async () => {
            try {
              await instrutorAPI.enviarFichaParaAluno(f.id, aluno.id);
              Alert.alert('Enviado!', `"${f.titulo}" enviada para ${aluno.nome}.`);
            } catch (err: any) {
              Alert.alert('Erro ao enviar', err.response?.data?.erro || err.message || 'Não foi possível enviar o treino.');
            }
          },
        })),
        { text: 'Cancelar', style: 'cancel' as const },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <AppHeader title={`Meus Alunos (${alunos.length})`} />

      <View style={{ padding: Spacing.lg }}>
        {alunos.map(aluno => (
          <Card key={aluno.id} neon={aluno.ativo} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <Avatar initials={aluno.nome.slice(0, 2).toUpperCase()} size={44} color={aluno.statusPagamento === 'pago' ? Colors.neon : aluno.statusPagamento === 'pendente' ? Colors.blue : Colors.pink} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: Typography.weights.bold, color: Colors.text }}>{aluno.nome}</Text>
                <Text style={{ fontSize: 11, color: Colors.textSub }}>{aluno.objetivo} · {aluno.nivel}</Text>
              </View>
              <StatusBadge status={aluno.statusPagamento} />
            </View>

            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
              <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: Colors.neon }}>{aluno.treinos}</Text>
                <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase' }}>Treinos</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: Colors.text }}>{aluno.peso}kg</Text>
                <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase' }}>Peso</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: aluno.peso < aluno.pesoInicial ? Colors.neon : Colors.red }}>
                  {(aluno.peso - aluno.pesoInicial) > 0 ? '+' : ''}{(aluno.peso - aluno.pesoInicial).toFixed(1)}kg
                </Text>
                <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase' }}>Evolução</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <NeonButton label="Enviar treino" onPress={() => enviarTreino(aluno)} style={{ flex: 1 }} small />
              <NeonButton label="Fatura" variant="ghost" onPress={() => {}} style={{ flex: 1 }} small />
              {!aluno.ativo && (
                <NeonButton label="Desbloquear" variant="purple" onPress={() => updateAluno(aluno.id, { ativo: true })} style={{ flex: 1 }} small />
              )}
              {aluno.ativo && aluno.statusPagamento === 'vencido' && (
                <NeonButton label="Bloquear" variant="danger" onPress={() => bloquearAluno(aluno.id)} style={{ flex: 1 }} small />
              )}
            </View>
          </Card>
        ))}

        <Card>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <NeonButton label="Liberar acesso" onPress={() => { Alert.alert('Convite enviado!', `Acesso liberado para ${emailNovo}`); setEmailNovo(''); }} style={{ flex: 1 }} small />
            <NeonButton label="Via QR Code" variant="ghost" onPress={() => Alert.alert('QR Code', 'Mostrar QR Code com o código de convite')} style={{ flex: 1 }} small />
          </View>
        </Card>

        {/* Criar e enviar treino */}
        <SectionTitle title="Criar e enviar treino" />
        <Card>
          {/* Título da ficha */}
          <Input
            label="Título do treino *"
            value={fichaTitle}
            onChangeText={setFichaTitle}
            placeholder="Ex: Treino A – Peito e Tríceps"
          />

          {/* Seletor de aluno */}
          <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 4 }}>
            Enviar para *
          </Text>
          {alunos.length === 0 ? (
            <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 10 }}>Nenhum aluno cadastrado ainda.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {alunos.map(a => (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => setAlunoParaTreino(a.id)}
                    style={{
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
                      borderWidth: 1.5,
                      borderColor: alunoParaTreino === a.id ? Colors.neonBorder : Colors.border,
                      backgroundColor: alunoParaTreino === a.id ? Colors.neonDim : Colors.card2,
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: Typography.weights.bold, color: alunoParaTreino === a.id ? Colors.neon : Colors.textSub }}>
                      {a.nome.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* Form de exercício */}
          <View style={{ backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 10, marginBottom: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Adicionar exercício
            </Text>
            <Input label="Nome *" value={formEx.nome} onChangeText={v => setFormEx(p => ({ ...p, nome: v }))} placeholder="Ex: Supino reto com barra" />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}><Input label="Séries" value={formEx.series} onChangeText={v => setFormEx(p => ({ ...p, series: v }))} placeholder="3" keyboardType="numeric" /></View>
              <View style={{ flex: 1 }}><Input label="Reps" value={formEx.reps} onChangeText={v => setFormEx(p => ({ ...p, reps: v }))} placeholder="12" /></View>
              <View style={{ flex: 1 }}><Input label="Descanso" value={formEx.descanso} onChangeText={v => setFormEx(p => ({ ...p, descanso: v }))} placeholder="60s" /></View>
            </View>
            <Input label="Observação" value={formEx.obs} onChangeText={v => setFormEx(p => ({ ...p, obs: v }))} placeholder="Dica de execução (opcional)" />
            <NeonButton label="+ Adicionar exercício" variant="ghost" onPress={adicionarEx} small />
          </View>

          {/* Lista de exercícios adicionados */}
          {exsNaFicha.length > 0 && (
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.neon, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                {exsNaFicha.length} exercício(s) adicionado(s)
              </Text>
              {exsNaFicha.map((ex, i) => (
                <View key={ex.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, padding: 10, marginBottom: 5, borderWidth: 1, borderColor: Colors.border }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: Typography.weights.bold, color: Colors.text }}>{i + 1}. {ex.nome}</Text>
                    <Text style={{ fontSize: 11, color: Colors.textSub }}>{ex.series}x{ex.reps} · {ex.descanso}{ex.obs ? ' · ' + ex.obs : ''}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setExsNaFicha(prev => prev.filter(e => e.id !== ex.id))} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 14, color: Colors.red }}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <NeonButton
            label={enviandoTreino ? 'Enviando...' : 'Criar e enviar treino'}
            onPress={criarEEnviar}
            loading={enviandoTreino}
            style={{ marginTop: 4 }}
          />
        </Card>
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
};

// ── Fichas de Treino Instrutor ─────────
type DiaPrograma = {
  id: string;
  nome: string;   // 'Segunda', 'Terça', ...
  abrev: string;  // 'Seg', 'Ter', ...
  grupo: string;
  exercicios: Array<{ id: string; nome: string; series: string; reps: string; descanso: string; obs: string }>;
};

const SEMANA: DiaPrograma[] = [
  { id: 'seg', nome: 'Segunda', abrev: 'Seg', grupo: '', exercicios: [] },
  { id: 'ter', nome: 'Terça',   abrev: 'Ter', grupo: '', exercicios: [] },
  { id: 'qua', nome: 'Quarta',  abrev: 'Qua', grupo: '', exercicios: [] },
  { id: 'qui', nome: 'Quinta',  abrev: 'Qui', grupo: '', exercicios: [] },
  { id: 'sex', nome: 'Sexta',   abrev: 'Sex', grupo: '', exercicios: [] },
];

export const TreinosInstrutorScreen = ({ navigation }: InstrutorScreenProps<'InstrutorHome'>) => {
  const { fichasTreino, alunos, setFichasTreino } = useStore();

  useEffect(() => {
    instrutorAPI.getFichas().then(r => setFichasTreino(r.data.map(mapFicha))).catch(() => {});
  }, []);

  // ── Builder de ficha semanal ──────────
  const [criandoPrograma, setCriandoPrograma] = useState(false);
  const [alunoDestino, setAlunoDestino] = useState('');
  const [diasPrograma, setDiasPrograma] = useState<DiaPrograma[]>(SEMANA.map(d => ({ ...d })));
  const [diaAtivoIdx, setDiaAtivoIdx] = useState(0);
  const [formEx, setFormEx] = useState({ nome: '', series: '3', reps: '12', descanso: '60s', obs: '' });
  const [enviandoPrograma, setEnviandoPrograma] = useState(false);

  const diaAtivo = diasPrograma[diaAtivoIdx];

  const resetBuilder = () => {
    setDiasPrograma(SEMANA.map(d => ({ ...d, exercicios: [] })));
    setDiaAtivoIdx(0);
    setAlunoDestino('');
    setFormEx({ nome: '', series: '3', reps: '12', descanso: '60s', obs: '' });
  };

  const adicionarExAoDia = () => {
    if (!formEx.nome.trim()) { Alert.alert('Informe o nome do exercício'); return; }
    setDiasPrograma(prev => prev.map((d, i) =>
      i === diaAtivoIdx
        ? { ...d, exercicios: [...d.exercicios, { ...formEx, id: String(Date.now()) }] }
        : d
    ));
    setFormEx({ nome: '', series: '3', reps: '12', descanso: '60s', obs: '' });
  };

  const removerExDoDia = (exId: string) => {
    setDiasPrograma(prev => prev.map((d, i) =>
      i === diaAtivoIdx ? { ...d, exercicios: d.exercicios.filter(e => e.id !== exId) } : d
    ));
  };

  const criarEEnviarPrograma = async () => {
    const diasComEx = diasPrograma.filter(d => d.exercicios.length > 0);
    if (diasComEx.length === 0) { Alert.alert('Sem exercícios', 'Adicione exercícios em pelo menos um dia.'); return; }
    setEnviandoPrograma(true);
    try {
      const novasFichas: FichaTreino[] = [];
      for (const dia of diasComEx) {
        const titulo = dia.grupo.trim() ? `${dia.nome} – ${dia.grupo.trim()}` : dia.nome;
        const res = await instrutorAPI.criarFicha({
          titulo,
          nivel: 'intermediario',
          duracao_min: 60,
          exercicios: dia.exercicios.map(e => ({
            nome: e.nome, series: e.series, repeticoes: e.reps,
            descanso: e.descanso, observacao: e.obs, grupoMuscular: dia.grupo,
          })),
        });
        await instrutorAPI.enviarFichaParaAluno(res.data.id, alunoDestino);
        novasFichas.push(mapFicha(res.data));
      }
      setFichasTreino([...novasFichas, ...fichasTreino]);
      const alunoNome = alunos.find(a => a.id === alunoDestino)?.nome || 'aluno';
      Alert.alert('Ficha enviada!', `${diasComEx.length} dia(s) de treino enviados para ${alunoNome}.`);
      setCriandoPrograma(false);
      resetBuilder();
    } catch (err: any) {
      Alert.alert('Erro', (err as any).response?.data?.erro || (err as any).message || 'Não foi possível enviar a ficha.');
    } finally {
      setEnviandoPrograma(false);
    }
  };

  const enviarFichaAvulsa = (ficha: FichaTreino) => {
    if (alunos.length === 0) { Alert.alert('Sem alunos', 'Você ainda não tem alunos cadastrados.'); return; }
    Alert.alert(`Enviar: ${ficha.titulo}`, 'Para qual aluno?', [
      ...alunos.map(a => ({
        text: a.nome,
        onPress: async () => {
          try {
            await instrutorAPI.enviarFichaParaAluno(ficha.id, a.id);
            Alert.alert('Enviado!', `Ficha enviada para ${a.nome}!`);
          } catch (err: any) {
            Alert.alert('Erro', (err as any).response?.data?.erro || (err as any).message || 'Não foi possível enviar.');
          }
        },
      })),
      { text: 'Cancelar', style: 'cancel' as const },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <AppHeader title="Fichas de Treino" />

      <View style={{ padding: Spacing.lg }}>
        {/* Botão principal */}
        <NeonButton
          label={criandoPrograma ? '✕ Cancelar' : '+ Nova ficha semanal para aluno'}
          variant={criandoPrograma ? 'ghost' : undefined}
          onPress={() => { setCriandoPrograma(v => !v); if (criandoPrograma) resetBuilder(); }}
          style={{ marginBottom: 14 }}
        />

        {/* Builder de ficha personalizada */}
        {criandoPrograma && (
          <Card style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: Typography.weights.bold, color: Colors.neon, marginBottom: 12 }}>
              Ficha semanal personalizada
            </Text>

            {/* 1 — Selecionar aluno */}
            <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
              1. Para qual aluno?
            </Text>
            {alunos.length === 0 ? (
              <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 12 }}>Nenhum aluno cadastrado ainda.</Text>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {alunos.map(a => (
                    <TouchableOpacity
                      key={a.id}
                      onPress={() => setAlunoDestino(a.id)}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 9, borderRadius: Radius.full,
                        borderWidth: 1.5,
                        borderColor: alunoDestino === a.id ? Colors.neonBorder : Colors.border,
                        backgroundColor: alunoDestino === a.id ? Colors.neonDim : Colors.card2,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: Typography.weights.bold, color: alunoDestino === a.id ? Colors.neon : Colors.textSub }}>
                        {a.nome.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* 2 — Tabs dias da semana */}
            <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              2. Monte os treinos por dia
            </Text>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
              {diasPrograma.map((d, i) => (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => setDiaAtivoIdx(i)}
                  style={{
                    flex: 1, paddingVertical: 9, borderRadius: Radius.md,
                    borderWidth: 1.5,
                    borderColor: diaAtivoIdx === i ? Colors.neonBorder : (d.exercicios.length > 0 ? Colors.neon + '40' : Colors.border),
                    backgroundColor: diaAtivoIdx === i ? Colors.neonDim : Colors.card2,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: Typography.weights.black, color: diaAtivoIdx === i ? Colors.neon : (d.exercicios.length > 0 ? Colors.neon : Colors.textSub) }}>
                    {d.abrev}
                  </Text>
                  <Text style={{ fontSize: 9, color: diaAtivoIdx === i ? Colors.neon : (d.exercicios.length > 0 ? Colors.neon : Colors.textFaint), marginTop: 2 }}>
                    {d.exercicios.length > 0 ? `${d.exercicios.length}ex` : '—'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Grupo muscular do dia ativo */}
            <Input
              label={`Grupo muscular — ${diaAtivo.nome}`}
              value={diaAtivo.grupo}
              onChangeText={v => setDiasPrograma(prev => prev.map((d, i) => i === diaAtivoIdx ? { ...d, grupo: v } : d))}
              placeholder="Ex: Peito e Tríceps, Costas e Bíceps..."
            />

            {/* Form de exercício */}
            <View style={{ backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 10, marginBottom: 10 }}>
              <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Adicionar exercício — {diaAtivo.nome}
              </Text>
              <Input label="Nome *" value={formEx.nome} onChangeText={v => setFormEx(p => ({ ...p, nome: v }))} placeholder="Ex: Supino reto com barra" />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}><Input label="Séries" value={formEx.series} onChangeText={v => setFormEx(p => ({ ...p, series: v }))} placeholder="3" keyboardType="numeric" /></View>
                <View style={{ flex: 1 }}><Input label="Reps" value={formEx.reps} onChangeText={v => setFormEx(p => ({ ...p, reps: v }))} placeholder="12" /></View>
                <View style={{ flex: 1 }}><Input label="Descanso" value={formEx.descanso} onChangeText={v => setFormEx(p => ({ ...p, descanso: v }))} placeholder="60s" /></View>
              </View>
              <Input label="Observação" value={formEx.obs} onChangeText={v => setFormEx(p => ({ ...p, obs: v }))} placeholder="Dica de execução (opcional)" />
              <NeonButton label="+ Adicionar exercício" variant="ghost" onPress={adicionarExAoDia} small />
            </View>

            {/* Lista de exercícios do dia ativo */}
            {diaAtivo.exercicios.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.neon, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                  {diaAtivo.exercicios.length} exercício(s) — {diaAtivo.nome}
                </Text>
                {diaAtivo.exercicios.map((ex, i) => (
                  <View key={ex.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, padding: 10, marginBottom: 5, borderWidth: 1, borderColor: Colors.border }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: Typography.weights.bold, color: Colors.text }}>{i + 1}. {ex.nome}</Text>
                      <Text style={{ fontSize: 11, color: Colors.textSub }}>{ex.series}x{ex.reps} · {ex.descanso}{ex.obs ? ' · ' + ex.obs : ''}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removerExDoDia(ex.id)} style={{ padding: 6 }}>
                      <Text style={{ fontSize: 14, color: Colors.red }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Resumo semanal */}
            <View style={{ backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 10, marginBottom: 14 }}>
              <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Resumo da semana
              </Text>
              {diasPrograma.map(d => (
                <View key={d.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: Colors.border + '50' }}>
                  <Text style={{ width: 52, fontSize: 11, fontWeight: Typography.weights.bold, color: d.exercicios.length > 0 ? Colors.neon : Colors.textFaint }}>{d.abrev}</Text>
                  <Text style={{ flex: 1, fontSize: 11, color: d.exercicios.length > 0 ? Colors.text : Colors.textFaint }}>
                    {d.grupo || (d.exercicios.length > 0 ? '—' : 'Descanso')}
                  </Text>
                  <Text style={{ fontSize: 11, color: d.exercicios.length > 0 ? Colors.neon : Colors.textFaint }}>
                    {d.exercicios.length > 0 ? `${d.exercicios.length} ex` : ''}
                  </Text>
                </View>
              ))}
            </View>

            {alunoDestino && (
              <View style={{ backgroundColor: Colors.neonDim, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.neonBorder, padding: 10, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 12, color: Colors.neon }}>✓ Aluno:</Text>
                <Text style={{ fontSize: 12, fontWeight: Typography.weights.bold, color: Colors.neon }}>
                  {alunos.find(a => a.id === alunoDestino)?.nome}
                </Text>
                <Text style={{ fontSize: 11, color: Colors.neon }}>
                  · {diasPrograma.filter(d => d.exercicios.length > 0).length} dia(s) com treino
                </Text>
              </View>
            )}

            <NeonButton
              label={enviandoPrograma ? 'Enviando...' : 'Enviar ficha para o aluno'}
              onPress={criarEEnviarPrograma}
              loading={enviandoPrograma}
            />
          </Card>
        )}

        {/* Fichas existentes */}
        {fichasTreino.length > 0 && (
          <>
            <SectionTitle title="Fichas enviadas" />
            {fichasTreino.map(ficha => (
              <Card key={ficha.id} neon style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: Typography.weights.bold, color: Colors.text, marginBottom: 2 }}>{ficha.titulo}</Text>
                    <Text style={{ fontSize: 11, color: Colors.textSub }}>{ficha.exercicios.length} exercícios · {ficha.duracao} min</Text>
                  </View>
                  <Tag label={ficha.nivel} color={ficha.nivel === 'Iniciante' ? 'purple' : ficha.nivel === 'Avançado' ? 'red' : 'blue'} />
                </View>

                <Divider style={{ marginVertical: 8 }} />

                {ficha.exercicios.slice(0, 4).map((ex, i) => (
                  <View key={ex.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
                    <Text style={{ fontSize: 12, color: Colors.text }}>{i + 1}. {ex.nome}</Text>
                    <Text style={{ fontSize: 11, color: Colors.textSub }}>{ex.series}x{ex.repeticoes} · {ex.descanso}</Text>
                  </View>
                ))}
                {ficha.exercicios.length > 4 && (
                  <Text style={{ fontSize: 11, color: Colors.textSub, marginTop: 2 }}>+{ficha.exercicios.length - 4} exercícios...</Text>
                )}

                <View style={{ marginTop: 12 }}>
                  <NeonButton label="Reenviar para aluno" onPress={() => enviarFichaAvulsa(ficha)} small />
                </View>
              </Card>
            ))}
          </>
        )}
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
};

// ── Faturas Instrutor ──────────────────
export const FaturasInstrutorScreen = () => {
  const { faturas, alunos, setAlunos, addFatura, setFaturas, marcarPago } = useStore();
  const [novaFat, setNovaFat] = useState({ alunoId: '', tipo: 'mensalidade', descricao: '', valor: '' });
  const [gerandoFatura, setGerandoFatura] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [alunosRes, faturasRes] = await Promise.all([
          instrutorAPI.getAlunos(),
          instrutorAPI.getFaturas(),
        ]);
        setAlunos(alunosRes.data.map(mapAluno));
        setFaturas(faturasRes.data.map(mapFatura));
      } catch {}
    };
    load();
  }, []);

  const totalRecebido = faturas.filter(f => f.status === 'pago').reduce((s, f) => s + f.valor, 0);
  const totalPendente = faturas.filter(f => f.status !== 'pago').reduce((s, f) => s + f.valor, 0);

  const tipoLabel: Record<string, string> = {
    mensalidade: 'Mensalidade',
    alteracao_treino: 'Alteração de Treino',
    atualizacao_dieta: 'Atualização de Dieta',
    personalizado: 'Personalizado',
  };

  const gerarFatura = async () => {
    if (!novaFat.alunoId) {
      Alert.alert('Selecione o aluno', 'Escolha para qual aluno esta fatura será enviada.');
      return;
    }
    if (!novaFat.valor) { Alert.alert('Informe o valor'); return; }
    const aluno = alunos.find(a => a.id === novaFat.alunoId);
    if (!aluno) {
      Alert.alert('Aluno inválido', 'Selecione um aluno da lista.');
      return;
    }
    const valor = parseFloat(novaFat.valor.replace(',', '.'));
    if (!Number.isFinite(valor) || valor <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor maior que zero.');
      return;
    }
    const vencimento = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    setGerandoFatura(true);
    try {
      const res = await instrutorAPI.criarFatura({
        alunoId: novaFat.alunoId,
        tipo: novaFat.tipo,
        descricao: novaFat.descricao || tipoLabel[novaFat.tipo],
        valor,
        vencimento,
      });
      addFatura(mapFatura(res.data));
      Alert.alert('Fatura gerada!', `A fatura foi enviada para ${aluno.nome}.`);
      setNovaFat({ alunoId: '', tipo: 'mensalidade', descricao: '', valor: '' });
    } catch (err: any) {
      Alert.alert('Erro ao gerar fatura', err.response?.data?.erro || err.message || 'Não foi possível enviar a fatura.');
    } finally {
      setGerandoFatura(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <AppHeader title="Faturas" />

      <View style={{ padding: Spacing.lg }}>
        <Card neon style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: Typography.weights.black, color: Colors.neon }}>R${totalRecebido.toLocaleString('pt-BR')}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Recebido</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: Colors.card2, borderRadius: Radius.md, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: Typography.weights.black, color: Colors.amber }}>R${totalPendente.toLocaleString('pt-BR')}</Text>
              <Text style={{ fontSize: 9, color: Colors.textSub, textTransform: 'uppercase', marginTop: 2 }}>Pendente</Text>
            </View>
          </View>
        </Card>

        <SectionTitle title="Cobranças recentes" />
        {faturas.map(fat => (
          <View key={fat.id} style={{ backgroundColor: Colors.card2, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, padding: 12, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: Typography.weights.bold, color: Colors.text }}>{fat.alunoNome}</Text>
              <Text style={{ fontSize: 15, fontWeight: Typography.weights.black, color: Colors.neon }}>R${fat.valor.toFixed(2).replace('.', ',')}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: fat.status !== 'pago' ? 8 : 0 }}>
              <Text style={{ fontSize: 11, color: Colors.textSub }}>{fat.descricao}</Text>
              <StatusBadge status={fat.status} />
            </View>
            {fat.status === 'pendente' && (
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <NeonButton label="Marcar pago" onPress={() => { marcarPago(fat.id); Alert.alert('Marcado como pago!'); }} style={{ flex: 1 }} small />
                <NeonButton label="Notificar" variant="ghost" onPress={() => Alert.alert('Notificação enviada!')} style={{ flex: 1 }} small />
              </View>
            )}
            {fat.status === 'vencido' && (
              <NeonButton label="Bloquear acesso do aluno" variant="danger" onPress={() => Alert.alert('Confirmar?', 'Bloquear acesso de ' + fat.alunoNome + '?', [{ text: 'Cancelar' }, { text: 'Bloquear', style: 'destructive', onPress: () => Alert.alert('Acesso bloqueado') }])} small />
            )}
          </View>
        ))}

        {/* Nova cobrança */}
        <SectionTitle title="Nova cobrança" />
        <Card>
          <Text style={{ fontSize: 10, color: Colors.textMid, textTransform: 'uppercase', fontWeight: Typography.weights.bold, letterSpacing: 0.5, marginBottom: 4 }}>Enviar para qual aluno?</Text>
          {alunos.length === 0 ? (
            <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 10 }}>Nenhum aluno cadastrado ainda.</Text>
          ) : (
            alunos.map(a => (
              <TouchableOpacity key={a.id} onPress={() => setNovaFat(p => ({ ...p, alunoId: a.id }))} style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: Radius.md, borderWidth: 1, borderColor: novaFat.alunoId === a.id ? Colors.neonBorder : Colors.border, backgroundColor: novaFat.alunoId === a.id ? Colors.neonDim : Colors.card2, marginBottom: 6 }}>
                <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: novaFat.alunoId === a.id ? Colors.neon : Colors.textSub, backgroundColor: novaFat.alunoId === a.id ? Colors.neon : 'transparent', marginRight: 9 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: Typography.weights.bold, color: novaFat.alunoId === a.id ? Colors.neon : Colors.text }}>{a.nome}</Text>
                  <Text style={{ fontSize: 10, color: Colors.textSub, marginTop: 1 }}>{a.email}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          <Text style={{ fontSize: 10, color: Colors.textMid, textTransform: 'uppercase', fontWeight: Typography.weights.bold, letterSpacing: 0.5, marginTop: 8, marginBottom: 4 }}>Tipo de cobrança</Text>
          {Object.entries(tipoLabel).map(([k, v]) => (
            <TouchableOpacity key={k} onPress={() => setNovaFat(p => ({ ...p, tipo: k }))} style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: novaFat.tipo === k ? Colors.neonBorder : Colors.border, backgroundColor: novaFat.tipo === k ? Colors.neonDim : Colors.card2, marginBottom: 5 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: novaFat.tipo === k ? Colors.neon : Colors.textSub, backgroundColor: novaFat.tipo === k ? Colors.neon : 'transparent', marginRight: 8 }} />
              <Text style={{ fontSize: 12, color: novaFat.tipo === k ? Colors.neon : Colors.text }}>{v}</Text>
            </TouchableOpacity>
          ))}

          <Input label="Valor (R$)" value={novaFat.valor} onChangeText={v => setNovaFat(p => ({ ...p, valor: v }))} placeholder="180,00" keyboardType="numeric" style={{ marginTop: 8 }} />
          <Input label="Descrição (opcional)" value={novaFat.descricao} onChangeText={v => setNovaFat(p => ({ ...p, descricao: v }))} placeholder="Detalhes da cobrança..." />
          <NeonButton
            label={gerandoFatura ? 'Gerando...' : 'Gerar e enviar fatura'}
            onPress={gerarFatura}
            loading={gerandoFatura}
            disabled={alunos.length === 0}
            small
          />
        </Card>
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
};

// ── Perfil Instrutor ───────────────────
export const PerfilInstrutorScreen = () => {
  const { user, token, setUser, logout } = useStore();
  const [nome, setNome] = useState(user?.nome || '');
  const [cref, setCref] = useState(user?.cref || '');
  const [pix, setPix] = useState(user?.pixChave || '');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setNome(user?.nome || '');
    setCref(user?.cref || '');
    setPix(user?.pixChave || '');
  }, [user]);

  const salvarPerfil = async () => {
    if (!nome.trim()) {
      Alert.alert('Campo obrigatório', 'Informe seu nome.');
      return;
    }

    setSalvando(true);
    try {
      const res = await instrutorAPI.atualizarPerfil({
        nome: nome.trim(),
        cref: cref.trim(),
        pix_chave: pix.trim(),
      });
      const u = res.data;

      if (user && token) {
        setUser({
          ...user,
          nome: u.nome,
          cref: u.cref,
          pixChave: u.pix_chave,
          codigoConvite: u.codigo_convite,
          avatarInitials: u.nome.slice(0, 2).toUpperCase(),
        }, token);
      }

      Alert.alert('Salvo!', 'Perfil atualizado com sucesso.');
    } catch (err: any) {
      Alert.alert('Erro ao salvar', err.response?.data?.erro || err.message || 'Não foi possível atualizar o perfil.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: Colors.bg }} showsVerticalScrollIndicator={false}>
      <AppHeader
        greeting="Perfil"
        title={user?.nome || ''}
        rightContent={
          <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: Colors.purpleDim, borderWidth: 1.5, borderColor: Colors.purple + '70', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: Typography.weights.black, color: '#cc88ff' }}>{user?.avatarInitials}</Text>
          </View>
        }
      />

      <View style={{ padding: Spacing.lg }}>
        <SectionTitle title="Configurações da conta" />
        <Card>
          <Input label="Nome completo" value={nome} onChangeText={setNome} placeholder="Seu nome" />
          <Input label="CREF" value={cref} onChangeText={setCref} placeholder="123456-G/SP" autoCapitalize="characters" />
          <Input label="E-mail" value={user?.email || ''} onChangeText={() => {}} placeholder="email@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Chave Pix" value={pix} onChangeText={setPix} placeholder="CPF, e-mail ou telefone" />
          <NeonButton label={salvando ? 'Salvando...' : 'Salvar alterações'} onPress={salvarPerfil} loading={salvando} small />
        </Card>

        <SectionTitle title="Notificações" />
        <Card>
          {[
            { label: 'Pagamentos recebidos', active: true },
            { label: 'Aluno completou treino', active: true },
            { label: 'Vencimento de faturas', active: false },
            { label: 'Novos alunos vinculados', active: true },
          ].map(item => (
            <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border }}>
              <Text style={{ fontSize: 13, color: Colors.text }}>{item.label}</Text>
              <View style={{ width: 40, height: 22, borderRadius: 11, backgroundColor: item.active ? Colors.neon : Colors.card2, justifyContent: 'center', paddingHorizontal: 3 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: item.active ? '#000' : Colors.textSub, alignSelf: item.active ? 'flex-end' : 'flex-start' }} />
              </View>
            </View>
          ))}
        </Card>

        <NeonButton label="Sair da conta" variant="danger" onPress={() => Alert.alert('Sair?', 'Deseja sair?', [{ text: 'Cancelar' }, { text: 'Sair', style: 'destructive', onPress: logout }])} style={{ marginTop: 10 }} />
        <View style={{ height: 30 }} />
      </View>
    </ScrollView>
  );
};
