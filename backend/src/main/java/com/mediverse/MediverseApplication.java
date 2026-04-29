package com.mediverse;

import com.mediverse.bootstrap.DotenvBootstrap;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@ConfigurationPropertiesScan
@EnableAsync
public class MediverseApplication {

    public static void main(String[] args) {
        DotenvBootstrap.apply();
        SpringApplication.run(MediverseApplication.class, args);
    }
}
