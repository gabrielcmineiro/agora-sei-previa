export const VOCAB = {
 understanding:{objeto:'Objetos reais',figura:'Figuras',frase:'Frases curtas',leitura:'Leitura',nao_sei:'Não sei'},
 communication:{gestos:'Gestos',palavras:'Palavras',frases:'Frases',figuras_ou_app:'Figuras ou app',nao_sei:'Não sei'},
 steps:{ainda_nao:'Ainda não',um:'Um passo',dois:'Dois ou mais passos',nao_sei:'Não sei'},
 sensitivities:{barulho:'Barulho',toque:'Toque',luz:'Luz forte',lugares_cheios:'Lugares cheios'},
 resources:{brinquedo:'Brinquedo conhecido',objeto_cotidiano:'Objeto cotidiano',papel:'Papel',impressora:'Impressora',livro_ou_figuras:'Livro ou figuras',espaco_calmo:'Espaço tranquilo',espaco_para_movimento:'Espaço para movimento'},
 interests:{brinquedos:'Brinquedos',desenho:'Desenho',movimento:'Movimento',livros:'Livros',musica:'Música',agua:'Água',animais:'Animais',montar:'Montar',faz_de_conta:'Faz de conta',personagens:'Personagens'},
 risks:{autolesao:'Machuca a si mesma',agressao_com_lesao:'Machuca outras pessoas',fuga:'Foge em lugar perigoso',dor_frequente:'Dor frequente',ronco_com_pausas:'Ronco com pausas na respiração'},
 diagnoses:{nenhum:'Sem diagnóstico',avaliacao:'Em avaliação',autismo:'Autismo informado',tdah:'TDAH informado',atraso_desenvolvimento:'Atraso do desenvolvimento',outro:'Outro'},
 support:{1:'1',2:'2',3:'3',nao_informado:'Prefiro não informar'},
 caregivers:{um:'Um cuidador',varios:'Mais de um cuidador',nao_informado:'Prefiro não informar'},
 minutes:{2:'2 minutos',5:'5 minutos',10:'10 minutos',20:'20 minutos',nao_sei:'Não sei'}
};
export const QUESTIONS = [
 ['priority','O que pede atenção hoje?','single',true],['queue','O que pode ficar para depois?','multi',false],
 ['understanding','Como a criança entende melhor?','single',true],['communication','Como costuma se comunicar?','single',true],
 ['steps','Como acompanha pedidos simples?','single',true],['interests','O que desperta interesse?','multi',false],
 ['minutes','Quanto tempo cabe hoje?','single',true],['resources','O que está disponível?','multi',true],
 ['sensitivities','Há estímulos a evitar?','multi',true],['caregivers','Quem participa dos cuidados?','single',true],
 ['risks','Há algo que pede outra ajuda?','multi',true],['diagnoses','Há algum diagnóstico informado?','multi',false],
 ['support','Nível de suporte informado em laudo','single',false]
].map(([key,label,type,required])=>({key,label,type,required,options:VOCAB[key]||{},showIf:key==='support'?{diagnoses:'autismo'}:null}));
