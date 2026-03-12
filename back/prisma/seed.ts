import { PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding data...');

  await prisma.book.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('12345678', 10);

  const authorsData = [
    {
      email: 'jkrowling@example.com',
      firstName: 'J.K.',
      lastName: 'Rowling',
      phone: '+44 1234567890',
      address: 'London, UK',
      books: [
        { title: "Harry Potter and the Sorcerer's Stone", description: "Harry Potter es un niño huérfano que descubre en su undécimo cumpleaños que es un mago y es enviado al Colegio Hogwarts de Magia y Hechicería. Allí descubre un mundo magical que conocía pero del que no formaba parte." },
        { title: "Harry Potter and the Chamber of Secrets", description: "Harry возвращается a Hogwarts para su segundo año, donde descubre que el basilisco está causando terror en la escuela y debe enfrentar a Voldemort por primera vez desde quella noche en Godric's Hollow." },
        { title: "Harry Potter and the Prisoner of Azkaban", description: "Harry descubre que Sirius Black, un peligroso asesino, ha escapado de Azkaban y parece estar buscándolo. En su tercer año en Hogwarts, Harry aprende sobre el pasado de sus padres." },
        { title: "Harry Potter and the Goblet of Fire", description: "Harry es inesperadamente seleccionado para competir en el Triwizard Tournament, un peligroso torneo entre tres escuelas de magia. Debe completar tres pruebas extremadamente difíciles mientras los mortífagos黑色的计划在进行中." },
      ]
    },
    {
      email: 'stephenking@example.com',
      firstName: 'Stephen',
      lastName: 'King',
      phone: '+1 5551234567',
      address: 'Maine, USA',
      books: [
        { title: "The Shining", description: "Jack Torrance acepta un trabajo como vigilante de hotel en las Montañas Rocosas durante el invierno. Su familia se muda al Hotel Overlook, donde fuerzas sobrenaturales comenzaron a influir en Jack." },
        { title: "IT", description: "Un grupo de niños conocidos como el Club de los Perdedores enfrenta a una entidad antigua que toma la forma de un payaso llamado Pennywise. La historia alterna entre su infancia y dewasa dewasa." },
        { title: "Misery", description: "El escritor Paul Sheldon sufre un accidente de coche y es salvado por Annie Wilkes, una enfermera obsesionada con sus novelas. Annie lo mantiene cautivo y le exige que escriba una nueva historia." },
        { title: "The Stand", description: "Un virus mortal elimina a la mayor parte de la humanidad. Los supervivientes se dividen entre el bien y el mal, liderados por Randall Flagg y Mother Abagail en una batalla final." },
      ]
    },
    {
      email: 'grrm@example.com',
      firstName: 'George R.R.',
      lastName: 'Martin',
      phone: '+1 5552345678',
      address: 'Santa Fe, NM',
      books: [
        { title: "A Game of Thrones", description: "En el continente de Westeros, las casas nobles libran una batalla por el control del Trono de Hierro mientras una amenaza antigua se despierta en el norte y los Stark deben proteger su hogar." },
        { title: "A Clash of Kings", description: "La guerra de los Cinco Reyes comienza mientras Stannis Baratheon reclama el trono, los Lannister enfrentan amenazas en múltiples frentes, y Daenerys Targaryen continúa su viaje." },
        { title: "A Storm of Swords", description: "La guerra alcanza su punto álgido con la Batalla de los Gemelos, la toma de Desembarco del Rey, y los cambios políticos que redefinen el poder en Westeros." },
      ]
    },
    {
      email: 'ggm@example.com',
      firstName: 'Gabriel García',
      lastName: 'Márquez',
      phone: '+57 1234567890',
      address: 'Cartagena, Colombia',
      books: [
        { title: "Cien Años de Soledad", description: "La saga de la familia Buendía en Macondo, desde su fundación hasta su destrucción. Siete generaciones viven amores imposibles, guerras civiles y el viento que barre el pueblo." },
        { title: "El Amor en los Tiempos del Cólera", description: "Florentino Ariza y Juvenal Urbino viven una historia de amor que dura más de cincuenta años, mientras Fermina Daza debe elegir entre ellos." },
        { title: "Chronicle of a Death Foretold", description: "En un pequeño pueblo colombiano, nadie detiene el asesinato de Santiago Nasar, aunque todos sabían que ocurriría. Un autopsy de un crimen que nadie quiso evitar." },
      ]
    },
    {
      email: 'iasimov@example.com',
      firstName: 'Isaac',
      lastName: 'Asimov',
      phone: '+1 5553456789',
      address: 'Boston, MA',
      books: [
        { title: "Foundation", description: "Psycólogo Hari Seldon predice la caída del Imperio Galáctico y crea la Fundación, una organización dedicada a preservar el conocimiento durante los 30,000 años de barbarie que vendrán." },
        { title: "Foundation and Empire", description: "La Fundación enfrenta su primera crisis cuando un mutante conocido como el Mulo aparece con el poder de conquistar mentes y amenaza con destruir todos los planes de Seldon." },
        { title: "Second Foundation", description: "La búsqueda de la Segunda Fundación revela que no está donde todos pensaban. La batalla final entre el Mulo y losfoundationistas alcanza su climax." },
      ]
    },
    {
      email: 'agatha@example.com',
      firstName: 'Agatha',
      lastName: 'Christie',
      phone: '+44 5554567890',
      address: 'Devon, UK',
      books: [
        { title: "Murder on the Orient Express", description: "El tren Orient Express queda atrapado en la nieve y un pasajero es asesinado. Hercule Poirot debe resolver el caso entre los pasajeros, todos con secretos que ocultar." },
        { title: "The Murder of Roger Ackroyd", description: "En el pueblo de King's Abbot, el rico Roger Ackroyd es asesinado. El narrador es el médico personal, pero la verdad es más complejas de lo que parece." },
        { title: "Death on the Nile", description: "Durante un crucero por el Nilo, una rica heredera es asesinado. Hercule Poirot debe resolver el caso entre los pasajeros mientras el barco queda varado." },
      ]
    },
    {
      email: 'haruki@example.com',
      firstName: 'Haruki',
      lastName: 'Murakami',
      phone: '+81 5555678901',
      address: 'Tokyo, Japan',
      books: [
        { title: "Norwegian Wood", description: "Toru Watanabe narra su vida universitaria en Tokio en los años 60, su relación con la frágil Naoko y la independiente Midori, en una historia de amor y pérdida." },
        { title: "Kafka on the Shore", description: "El adolescente Kafka Tamura huye de casa y termina en un pueblo costero donde los sueños y la realidad se mezclan, mientras un hombre mayor puede hablar con gatos." },
        { title: "1Q84", description: "En el Tokio de 1984, Aomame y Tengo viven en realidades ligeramente diferentes. El libro explora la soledad, el amor y los mundos paralelos." },
      ]
    },
    {
      email: 'paulo@example.com',
      firstName: 'Paulo',
      lastName: 'Coelho',
      phone: '+55 5556789012',
      address: 'Rio de Janeiro, Brazil',
      books: [
        { title: "The Alchemist", description: "Santiago, un pastor español, sueña con un tesoro en Egipto. Viaja a través de África siguiendo las señales del universo en busca de su leyenda personal." },
        { title: "The Pilgrimage", description: "Paulo Coelho narra su propio viaje por el Camino de Santiago, descubriendo los rituales del misticismo y la búsqueda de la iluminación espiritual." },
        { title: "Brida", description: "Una joven irlandesa busca a un mago que la enseñe sobre la magia, mientras conoce a un maestro que le revela los secretos del mundo y del alma." },
      ]
    },
    {
      email: 'neilgaiman@example.com',
      firstName: 'Neil',
      lastName: 'Gaiman',
      phone: '+44 5557890123',
      address: 'Wisconsin, USA',
      books: [
        { title: "American Gods", description: "Shadow Moon sale de prisión para descubrir que su esposa murió y que dioses antiguos y nuevos viven entre nosotros. Una historia sobre la fe y el poder en la América moderna." },
        { title: "The Sandman: Preludes", description: "Morfeo, el Señor de los Sueños, escapa de su cautiverio de setenta años y debe recuperar sus herramientas de poder: casco, bolsa de arena y rubí." },
        { title: "Neverwhere", description: "Richard Mayhew descubre el Londres de Abajo, un mundo subterráneo de nobles, monstruos y entidades extrañas que existe paralelo a la ciudad que conoce." },
      ]
    },
    {
      email: 'ursula@example.com',
      firstName: 'Ursula K.',
      lastName: 'Le Guin',
      phone: '+1 5558901234',
      address: 'California, USA',
      books: [
        { title: "The Left Hand of Darkness", description: "En el planeta Gethen, los habitantes pueden cambiar de género. Un enviado de la Tierra debe navegar la política del mundo mientras intenta completar su misión." },
        { title: "A Wizard of Earthsea", description: "Ged, un joven con poderes mágicos, estudia en la escuela de Magia de Roke. Su orgullo lo lleva a invocar sombras que perseguirán toda su vida." },
        { title: "The Dispossessed", description: "En el planeta Anarres, dos sociedades coexisten: una capitalista y otra anarquista. Un físico intenta cruzar la barrera entre mundos." },
      ]
    },
    {
      email: 'cormac@example.com',
      firstName: 'Cormac',
      lastName: 'McCarthy',
      phone: '+1 5559012345',
      address: 'Texas, USA',
      books: [
        { title: "The Road", description: "Un padre y su hijo caminan solos a través de un Estados Unidos post-apocalíptico. Sin civilización, sin esperanza, solo la necesidad de sobrevivir y mantener viva la llama." },
        { title: "No Country for Old Men", description: "En el año 1980, un hombre encuentra dinero de un narco después de un masacre. Esto atrae a Anton Chigurh, un asesino implacable con su propia moral." },
        { title: "Blood Meridian", description: "El Niño se une a una banda de cazadores de scalps liderada por el Judge Holden, un hombre violento y filosófico, en la frontera México-Estados Unidos." },
      ]
    },
    {
      email: 'julialvarez@example.com',
      firstName: 'Julia',
      lastName: 'Alvarez',
      phone: '+1 5550123456',
      address: 'Dominican Republic',
      books: [
        { title: "In the Time of the Butterflies", description: "La historia de las cuatro sisters Mirabal, activistas políticas que resistieron al régimen de Trujillo en República Dominicana. Ficción basada en eventos reales." },
        { title: "How the Garcia Girls Lost Their Accents", description: "La historia de cuatro sisters dominicanas que emmigran a Estados Unidos y deben navegar entre dos culturas, perdiendo su lengua y ganándose una nueva identidad." },
        { title: "In the Name of the Father", description: "La historia de Evangelina, una joven que desafía las tradiciones familiares al buscar educación y amor en una sociedad dominicana conservadora." },
      ]
    }
  ];

  for (const author of authorsData) {
    const user = await prisma.user.create({
      data: {
        email: author.email,
        password,
        profile: {
          create: {
            firstName: author.firstName,
            lastName: author.lastName,
            phone: author.phone,
            address: author.address,
          },
        },
      },
      include: { profile: true },
    });

    await prisma.book.createMany({
      data: author.books.map(book => ({
        title: book.title,
        description: book.description,
        published: true,
        authorId: user.profile!.id,
      })),
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
