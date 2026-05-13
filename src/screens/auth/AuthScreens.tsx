import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Alert, StyleSheet, Image,
} from 'react-native';

const logo = require('../../../assets/logo.png');
import { Colors, Typography, Spacing, Radius, Shadows } from '../../theme';
import { NeonButton, Input } from '../../components';
import { useStore } from '../../services/store';
import { authAPI } from '../../services/api';
import type { AuthScreenProps } from '../../types/navigation';

const S = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  logo: { fontSize: 32, fontWeight: Typography.weights.black, letterSpacing: -1, color: Colors.text },
  tagline: { fontSize: 13, color: Colors.textSub, marginTop: 6, textAlign: 'center' },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    width: '100%',
    marginTop: Spacing.xxl,
  },
  link: { color: Colors.neon, fontWeight: Typography.weights.bold, fontSize: 12 },
});

const safeMessage = (value: unknown, fallback: string) => {
  if (typeof value === 'string' && value.trim()) return value;
  return fallback;
};

export const WelcomeScreen = ({ navigation }: AuthScreenProps<'Welcome'>) => (
  <View style={[S.screen, S.center]}>
    <View style={{ marginBottom: 40, alignItems: 'center' }}>
      <View style={{ width: 70, height: 70, borderRadius: 22, backgroundColor: Colors.neonDim, borderWidth: 1.5, borderColor: Colors.neonBorder, alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...Shadows.neonSm }}>
        <Image source={logo} style={{ width: 50, height: 50, borderRadius: 12 }} resizeMode="contain" />
      </View>
      <Text style={S.logo}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
      <Text style={S.tagline}>Sua plataforma fitness completa{'\n'}com IA coach personalizada</Text>
    </View>

    <View style={{ width: '100%', gap: 12 }}>
      <NeonButton label="Sou Instrutor / Professor" onPress={() => navigation.navigate('LoginInstrutor')} />
      <NeonButton label="Sou Aluno" onPress={() => navigation.navigate('LoginAluno')} variant="ghost" />
    </View>
  </View>
);

export const LoginInstrutorScreen = ({ navigation }: AuthScreenProps<'LoginInstrutor'>) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore((s) => s.setUser);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.loginInstrutor(email, senha);
      const { token, user } = res.data || {};
      if (!token || !user?.id || !user?.email) {
        throw new Error('Resposta de login do instrutor invalida.');
      }

      setUser({
        id: user?.id,
        nome: user?.nome,
        email: user?.email,
        role: 'instrutor',
        cref: user?.cref,
        pixChave: user?.pix_chave,
        codigoConvite: user?.codigo_convite,
        avatarInitials: user?.nome?.slice?.(0, 2)?.toUpperCase?.() || 'IN',
      }, token);
    } catch (err: any) {
      if (err?.response?.data?.emailPendente) {
        Alert.alert('Verifique seu email', 'Digite o código que enviamos para ativar sua conta.', [
          { text: 'Digitar código', onPress: () => navigation.navigate('CadastroInstrutor', { emailPendente: email }) },
        ]);
      } else {
        Alert.alert('Erro ao entrar', safeMessage(err?.response?.data?.erro, 'Verifique suas credenciais e tente novamente.'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
      <ScrollView contentContainerStyle={[S.center, { paddingVertical: 60 }]}>
        <Text style={[S.logo, { marginBottom: 4 }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 32 }}>Acesso Instrutor</Text>

        <View style={S.card}>
          <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Senha" value={senha} onChangeText={setSenha} placeholder="••••••••" secureTextEntry />
          <NeonButton label="Entrar como Instrutor" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
            <Text style={{ color: Colors.textSub, fontSize: 12 }}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CadastroInstrutor')}>
              <Text style={S.link}>Cadastrar-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const CadastroInstrutorScreen = ({ navigation, route }: AuthScreenProps<'CadastroInstrutor'>) => {
  const emailParam = route.params?.emailPendente || '';
  const [etapa, setEtapa] = useState<1 | 2>(emailParam ? 2 : 1);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState(emailParam);
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cref, setCref] = useState('');
  const [telefone, setTelefone] = useState('');
  const [codigo, setCodigo] = useState('');
  const [emailPendente, setEmailPendente] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [loadingReenvio, setLoadingReenvio] = useState(false);
  const setUser = useStore((s) => s.setUser);

  useEffect(() => {
    if (route.params?.emailPendente) {
      setEmail(route.params.emailPendente);
      setEmailPendente(route.params.emailPendente);
      setEtapa(2);
    }
  }, [route.params?.emailPendente]);

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !cref) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }
    if (senha !== confirmar) {
      Alert.alert('Erro', 'As senhas não conferem.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.cadastroInstrutor({ nome, email, senha, cref, telefone });
      setEmailPendente(res.data?.email || email);
      setCodigo('');
      setEtapa(2);
      Alert.alert('Sucesso', 'Cadastro iniciado. Confira o código enviado por email.');
    } catch (err: any) {
      Alert.alert('Erro ao cadastrar', safeMessage(err?.response?.data?.erro, 'Não foi possível concluir o cadastro.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerificar = async () => {
    if (codigo.length !== 6) {
      Alert.alert('Erro', 'Digite exatamente 6 dígitos.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.verificarEmailInstrutor(emailPendente, codigo);
      const { token, user } = res.data || {};
      if (!token || !user?.id || !user?.email) {
        throw new Error('Resposta de verificacao do instrutor invalida.');
      }

      setUser({
        id: user?.id,
        nome: user?.nome,
        email: user?.email,
        role: 'instrutor',
        cref: user?.cref,
        pixChave: user?.pix_chave,
        codigoConvite: user?.codigo_convite,
        avatarInitials: user?.nome?.slice?.(0, 2)?.toUpperCase?.() || 'IN',
      }, token);
    } catch (err: any) {
      Alert.alert('Código inválido ou expirado', safeMessage(err?.response?.data?.erro, 'Verifique o código e tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    setLoadingReenvio(true);
    try {
      await authAPI.reenviarCodigoInstrutor(emailPendente);
      Alert.alert('Código reenviado', 'Verifique sua caixa de entrada.');
    } catch {
      Alert.alert('Erro', 'Não foi possível reenviar o código.');
    } finally {
      setLoadingReenvio(false);
    }
  };

  if (etapa === 2) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
        <ScrollView contentContainerStyle={[S.center, { paddingVertical: 60 }]}>
          <Text style={[S.logo, { marginBottom: 4 }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
          <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 32 }}>Ative sua conta</Text>

          <View style={S.card}>
            <Input
              label="Código de ativação"
              value={codigo}
              onChangeText={(v) => setCodigo(v.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              keyboardType="numeric"
              autoFocus
            />
            <NeonButton label="Ativar conta" onPress={handleVerificar} loading={loading} style={{ marginTop: 8 }} />

            <TouchableOpacity onPress={handleReenviar} disabled={loadingReenvio} style={{ marginTop: 16, alignItems: 'center' }}>
              <Text style={{ color: Colors.textSub, fontSize: 12 }}>
                {loadingReenvio ? 'Reenviando...' : 'Não recebeu? '}
                <Text style={S.link}>{loadingReenvio ? '' : 'Reenviar código'}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
      <ScrollView contentContainerStyle={{ padding: Spacing.xl, paddingTop: 60 }}>
        <Text style={[S.logo, { marginBottom: 4, textAlign: 'center' }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 28, textAlign: 'center' }}>Cadastro de Instrutor</Text>

        <Input label="Nome completo *" value={nome} onChangeText={setNome} placeholder="Prof. Ana Beatriz Santos" />
        <Input label="E-mail *" value={email} onChangeText={setEmail} placeholder="ana@email.com" keyboardType="email-address" autoCapitalize="none" />
        <Input label="CREF *" value={cref} onChangeText={setCref} placeholder="123456-G/SP" autoCapitalize="characters" />
        <Input label="Telefone" value={telefone} onChangeText={setTelefone} placeholder="(11) 99999-9999" keyboardType="phone-pad" />
        <Input label="Senha *" value={senha} onChangeText={setSenha} placeholder="Mínimo 8 caracteres" secureTextEntry />
        <Input label="Confirmar senha *" value={confirmar} onChangeText={setConfirmar} placeholder="Repita a senha" secureTextEntry />

        <NeonButton label="Criar conta de Instrutor" onPress={handleCadastro} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const LoginAlunoScreen = ({ navigation }: AuthScreenProps<'LoginAluno'>) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore((s) => s.setUser);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.loginAluno(email, senha);
      const { token, user } = res.data || {};
      if (!token || !user?.id || !user?.email) {
        throw new Error('Resposta de login do aluno invalida.');
      }

      setUser({
        id: user?.id,
        nome: user?.nome,
        email: user?.email,
        role: 'aluno',
        instrutorId: user?.instrutor_id,
        instrutorNome: user?.instrutor_nome,
        nivel: user?.nivel_gamif,
        xp: user?.xp,
        peso: user?.peso,
        altura: user?.altura,
        objetivo: user?.objetivo,
        avatarInitials: user?.avatar_initials,
      }, token);
    } catch (err: any) {
      Alert.alert('Erro ao entrar', safeMessage(err?.response?.data?.erro, 'Verifique suas credenciais e tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
      <ScrollView contentContainerStyle={[S.center, { paddingVertical: 60 }]}>
        <Text style={[S.logo, { marginBottom: 4 }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 32 }}>Acesso Aluno</Text>

        <View style={S.card}>
          <Input label="E-mail" value={email} onChangeText={setEmail} placeholder="seu@email.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Senha" value={senha} onChangeText={setSenha} placeholder="••••••••" secureTextEntry />
          <NeonButton label="Entrar como Aluno" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 14 }}>
            <Text style={{ color: Colors.textSub, fontSize: 12 }}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CadastroAluno')}>
              <Text style={S.link}>Cadastrar-se</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export const CadastroAlunoScreen = ({ navigation }: AuthScreenProps<'CadastroAluno'>) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [codigo, setCodigo] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [objetivo, setObjetivo] = useState('Hipertrofia');
  const [loading, setLoading] = useState(false);
  const setUser = useStore((s) => s.setUser);

  const objetivos = ['Hipertrofia', 'Emagrecimento', 'Definição', 'Manutenção', 'Saúde geral'];

  const handleCadastro = async () => {
    if (!nome || !email || !senha || !codigo) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.cadastroAluno({
        nome,
        email,
        senha,
        codigoInstrutor: codigo,
        peso: +peso || 70,
        altura: +altura || 170,
        objetivo,
      });

      const { token, user } = res.data || {};
      if (!token || !user?.id || !user?.email) {
        throw new Error('Resposta de cadastro do aluno invalida.');
      }
      setUser({
        id: user?.id,
        nome: user?.nome,
        email: user?.email,
        role: 'aluno',
        instrutorId: user?.instrutor_id,
        instrutorNome: user?.instrutor_nome,
        nivel: user?.nivel_gamif || 1,
        xp: user?.xp || 0,
        peso: user?.peso,
        altura: user?.altura,
        objetivo,
        avatarInitials: user?.avatar_initials,
      }, token);
    } catch (err: any) {
      Alert.alert('Erro ao cadastrar', safeMessage(err?.response?.data?.erro, 'Não foi possível concluir o cadastro.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={S.screen}>
      <ScrollView contentContainerStyle={{ padding: Spacing.xl, paddingTop: 60 }}>
        <Text style={[S.logo, { marginBottom: 4, textAlign: 'center' }]}>CAMIS<Text style={{ color: Colors.neon }}>FIT</Text></Text>
        <Text style={{ fontSize: 12, color: Colors.textSub, marginBottom: 24, textAlign: 'center' }}>Cadastro de Aluno</Text>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          {[1, 2].map((n) => (
            <View key={n} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: n <= step ? Colors.neon : Colors.border }} />
          ))}
        </View>

        {step === 1 ? (
          <>
            <Input label="Nome completo *" value={nome} onChangeText={setNome} placeholder="Rafael Silva" />
            <Input label="E-mail *" value={email} onChangeText={setEmail} placeholder="rafael@email.com" keyboardType="email-address" autoCapitalize="none" />
            <Input label="Senha *" value={senha} onChangeText={setSenha} placeholder="Mínimo 8 caracteres" secureTextEntry />
            <Input label="Código do Instrutor *" value={codigo} onChangeText={(v) => setCodigo(v.toUpperCase())} placeholder="Ex: ANA-847" autoCapitalize="characters" />
            <NeonButton
              label="Próximo →"
              onPress={() => {
                if (!nome || !email || !senha || !codigo) {
                  Alert.alert('Erro', 'Preencha todos os campos.');
                  return;
                }
                setStep(2);
              }}
              style={{ marginTop: 8 }}
            />
          </>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
              <View style={{ flex: 1 }}><Input label="Peso (kg)" value={peso} onChangeText={setPeso} placeholder="70" keyboardType="numeric" /></View>
              <View style={{ flex: 1 }}><Input label="Altura (cm)" value={altura} onChangeText={setAltura} placeholder="170" keyboardType="numeric" /></View>
            </View>

            <Text style={{ fontSize: 10, fontWeight: Typography.weights.bold, color: Colors.textMid, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Objetivo principal
            </Text>
            {objetivos.map((o) => (
              <TouchableOpacity key={o} onPress={() => setObjetivo(o)} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: Radius.md, borderWidth: 1, borderColor: o === objetivo ? Colors.neonBorder : Colors.border, backgroundColor: o === objetivo ? Colors.neonDim : Colors.card, marginBottom: 6 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: o === objetivo ? Colors.neon : Colors.textSub, backgroundColor: o === objetivo ? Colors.neon : 'transparent', marginRight: 10 }} />
                <Text style={{ fontSize: 13, color: o === objetivo ? Colors.neon : Colors.text }}>{o}</Text>
              </TouchableOpacity>
            ))}

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <NeonButton label="← Voltar" onPress={() => setStep(1)} variant="ghost" style={{ flex: 1 }} />
              <NeonButton label="Criar conta" onPress={handleCadastro} loading={loading} style={{ flex: 1 }} />
            </View>
          </>
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
          <Text style={{ color: Colors.textSub, fontSize: 12 }}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('LoginAluno')}>
            <Text style={S.link}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
