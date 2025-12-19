FROM scratch

# 拷贝本地 JDK
COPY jdk /jdk

# 拷贝 Spring Boot jar
COPY target/online-doctor-appointment-0.0.1-SNAPSHOT.jar /app.jar

EXPOSE 8080

CMD ["/jdk/jdk-11.0.29.7-hotspot/bin/java", "-jar", "/app.jar"]
