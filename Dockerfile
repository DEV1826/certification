# Étape 1 : Build de l'application avec Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Étape 2 : Exécution de l'application
FROM eclipse-temurin:17-jre
WORKDIR /app

# Installation de OpenSSL (Indispensable pour votre PKI)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copie du fichier JAR généré à l'étape 1
COPY --from=build /app/target/*.jar app.jar

# Exposition du port (Render utilise généralement 8080 ou 10000)
EXPOSE 8080

# Lancement de l'application
ENTRYPOINT ["java", "-jar", "app.jar"]