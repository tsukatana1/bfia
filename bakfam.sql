PGDMP     $                    x         	   BakFamily    12.2    12.2     "           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            #           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            $           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            %           1262    41031 	   BakFamily    DATABASE     �   CREATE DATABASE "BakFamily" WITH TEMPLATE = template0 ENCODING = 'UTF8' LC_COLLATE = 'English_United States.1252' LC_CTYPE = 'English_United States.1252';
    DROP DATABASE "BakFamily";
                postgres    false            �           1247    57444    gender    TYPE     M   CREATE TYPE public.gender AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);
    DROP TYPE public.gender;
       public          postgres    false            }           1247    49254    perms    TYPE     ?   CREATE TYPE public.perms AS ENUM (
    'basic',
    'admin'
);
    DROP TYPE public.perms;
       public          postgres    false            �           1247    57428    report_reason    TYPE     �   CREATE TYPE public.report_reason AS ENUM (
    'INAPPROPRIATE',
    'ADVERTISING',
    'EXPLIOTING',
    'OTHER',
    'STATUS'
);
     DROP TYPE public.report_reason;
       public          postgres    false            �            1259    49223    accounts    TABLE     <  CREATE TABLE public.accounts (
    display_name text NOT NULL,
    password text,
    account_creation bigint,
    email text NOT NULL,
    username text,
    user_id bigint,
    public boolean,
    description text,
    permiss public.perms,
    donor boolean,
    actual_name text,
    acc_gender public.gender
);
    DROP TABLE public.accounts;
       public         heap    postgres    false    651    637            �            1259    49235    donors    TABLE     x   CREATE TABLE public.donors (
    pass text,
    children_info jsonb[],
    user_id bigint,
    "subscriptionID" text
);
    DROP TABLE public.donors;
       public         heap    postgres    false            �            1259    49241    mail    TABLE     W   CREATE TABLE public.mail (
    username text,
    password text,
    user_id bigint
);
    DROP TABLE public.mail;
       public         heap    postgres    false            �            1259    57437    reports    TABLE     |   CREATE TABLE public.reports (
    user_id bigint,
    descr text,
    reason public.report_reason,
    reporteeid bigint
);
    DROP TABLE public.reports;
       public         heap    postgres    false    644            �            1259    49259    reviews    TABLE     t   CREATE TABLE public.reviews (
    user_id bigint,
    content text,
    stars smallint,
    creation_time bigint
);
    DROP TABLE public.reviews;
       public         heap    postgres    false                      0    49223    accounts 
   TABLE DATA           �   COPY public.accounts (display_name, password, account_creation, email, username, user_id, public, description, permiss, donor, actual_name, acc_gender) FROM stdin;
    public          postgres    false    202                    0    49235    donors 
   TABLE DATA           P   COPY public.donors (pass, children_info, user_id, "subscriptionID") FROM stdin;
    public          postgres    false    203   5                 0    49241    mail 
   TABLE DATA           ;   COPY public.mail (username, password, user_id) FROM stdin;
    public          postgres    false    204   �                 0    57437    reports 
   TABLE DATA           E   COPY public.reports (user_id, descr, reason, reporteeid) FROM stdin;
    public          postgres    false    206                    0    49259    reviews 
   TABLE DATA           I   COPY public.reviews (user_id, content, stars, creation_time) FROM stdin;
    public          postgres    false    205   r       �
           2606    49234    accounts accounts_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (email);
 @   ALTER TABLE ONLY public.accounts DROP CONSTRAINT accounts_pkey;
       public            postgres    false    202                  x������ � �         �   x����V���QJLO�V
@���Hꀘy��pa#C���2�:�dzj^JjL�-571$W�T��D\1�0\�D#C�b7�ݑ*FI*�*�Q���I��Q�����iQyiQ����&.��iAI>�y�ez�F^n���nz4	;c##Ssp �qqq �qyd            x������ � �         \   x�363200723�LLM+.O,OLI,O��@���������ijhjdjndn�enabi``an�Y�
��E�@��(�<�M\)W� �h +         .   x�36�02�0��OOO-*V(�O/��4�45636536����� �J�     